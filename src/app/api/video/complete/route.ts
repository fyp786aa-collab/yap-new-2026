import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { publicApplicationStatus } from "@/lib/public-application-status";
import { upsertDocument } from "@/lib/db-queries/sections";
import {
  getDriveFileMetadata,
  deleteFileFromDrive,
  findLatestDriveFileByNameInSubfolder,
} from "@/lib/google-drive";
import { MAX_FILE_SIZES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const application = await getApplicationByUserId(session.user.id);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    const isApplicant = session.user.role === "applicant";
    if (
      isApplicant &&
      publicApplicationStatus(application.status) === "Submitted"
    ) {
      return NextResponse.json(
        { error: "Application already submitted" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const applicationId = body?.applicationId as string;
    const documentType = body?.documentType as string;
    const fileId = (body?.fileId as string) || "";
    const fileName = (body?.fileName as string) || "";

    if (!applicationId || !documentType || (!fileId && !fileName)) {
      return NextResponse.json(
        { error: "Missing applicationId, documentType, and file reference" },
        { status: 400 },
      );
    }

    if (applicationId !== application.id) {
      return NextResponse.json(
        { error: "Invalid application" },
        { status: 403 },
      );
    }

    if (documentType !== "Video") {
      return NextResponse.json(
        { error: "This endpoint only supports Video uploads" },
        { status: 400 },
      );
    }

    let resolvedFileId = fileId;
    if (!resolvedFileId && fileName) {
      const matched = await findLatestDriveFileByNameInSubfolder(
        fileName,
        `${session.user.email}_${applicationId}`,
      );
      resolvedFileId = matched?.id || "";
    }

    if (!resolvedFileId) {
      return NextResponse.json(
        { error: "Could not identify uploaded file on Drive" },
        { status: 400 },
      );
    }

    const metadata = await getDriveFileMetadata(resolvedFileId);

    if (metadata.mimeType !== "video/mp4") {
      await deleteFileFromDrive(resolvedFileId);
      return NextResponse.json(
        { error: "Uploaded file is not MP4" },
        { status: 400 },
      );
    }

    if (metadata.size > MAX_FILE_SIZES.VIDEO) {
      await deleteFileFromDrive(resolvedFileId);
      const maxMB = Math.round(MAX_FILE_SIZES.VIDEO / (1024 * 1024));
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB` },
        { status: 400 },
      );
    }

    const filePath = `https://drive.google.com/file/d/${resolvedFileId}/view`;
    const resolvedName = metadata.name || fileName || `video-${resolvedFileId}`;
    const save = await upsertDocument(
      applicationId,
      documentType,
      filePath,
      resolvedName,
    );

    if (!save.success) {
      return NextResponse.json(
        { error: save.error || "Failed to save document" },
        { status: 500 },
      );
    }

    revalidateTag(`application:${applicationId}`, "max");

    return NextResponse.json({
      success: true,
      fileId: resolvedFileId,
      fileName: resolvedName,
      filePath,
    });
  } catch (error) {
    console.error("Finalize video upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
