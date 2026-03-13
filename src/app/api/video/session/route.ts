import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { publicApplicationStatus } from "@/lib/public-application-status";
import { createDriveResumableUploadSession } from "@/lib/google-drive";
import { MAX_FILE_SIZES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
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
    const fileName = body?.fileName as string;
    const fileType = body?.fileType as string;
    const fileSize = Number(body?.fileSize || 0);

    if (
      !applicationId ||
      !documentType ||
      !fileName ||
      !fileType ||
      !fileSize
    ) {
      return NextResponse.json(
        { error: "Missing required upload metadata" },
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

    if (fileType !== "video/mp4") {
      return NextResponse.json(
        { error: "Invalid file type. Only MP4 is allowed." },
        { status: 400 },
      );
    }

    if (fileSize > MAX_FILE_SIZES.VIDEO) {
      const maxMB = Math.round(MAX_FILE_SIZES.VIDEO / (1024 * 1024));
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB` },
        { status: 400 },
      );
    }

    const { uploadUrl } = await createDriveResumableUploadSession(
      fileName,
      fileType,
      fileSize,
      `${session.user.email}_${applicationId}`,
    );

    return NextResponse.json({ success: true, uploadUrl });
  } catch (error) {
    console.error("Create video upload session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
