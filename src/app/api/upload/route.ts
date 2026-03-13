import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { publicApplicationStatus } from "@/lib/public-application-status";
import { uploadFileToDrive, deleteFileFromDrive } from "@/lib/google-drive";
import { upsertDocument, deleteDocument } from "@/lib/db-queries/sections";
import { MAX_FILE_SIZES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify application exists and not submitted
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const applicationId = formData.get("applicationId") as string;
    const documentType = formData.get("documentType") as string;

    if (!file || !applicationId || !documentType) {
      return NextResponse.json(
        { error: "Missing file, applicationId, or documentType" },
        { status: 400 },
      );
    }

    // Verify applicationId matches
    if (applicationId !== application.id) {
      return NextResponse.json(
        { error: "Invalid application" },
        { status: 403 },
      );
    }

    // Validate document type
    const validTypes = ["CV", "Transcript", "Video"];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 },
      );
    }

    // Validate file size
    const maxSize =
      documentType === "CV"
        ? MAX_FILE_SIZES.CV
        : documentType === "Transcript"
          ? MAX_FILE_SIZES.TRANSCRIPT
          : MAX_FILE_SIZES.VIDEO;

    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxMB}MB` },
        { status: 400 },
      );
    }

    if (documentType === "Video" && file.type !== "video/mp4") {
      return NextResponse.json(
        { error: "Invalid file type. Only MP4 is allowed." },
        { status: 400 },
      );
    }

    // Upload to Google Drive
    const buffer = Buffer.from(await file.arrayBuffer());
    const driveResult = await uploadFileToDrive(
      buffer,
      file.name,
      file.type,
      `${session.user.email}_${applicationId}`,
    );

    if (!driveResult.fileId) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 },
      );
    }

    // Save to database
    const filePath = `https://drive.google.com/file/d/${driveResult.fileId}/view`;
    await upsertDocument(applicationId, documentType, filePath, file.name);

    return NextResponse.json({
      success: true,
      fileId: driveResult.fileId,
      fileName: file.name,
      filePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const isApplicantDel = session.user.role === "applicant";
    if (
      isApplicantDel &&
      publicApplicationStatus(application.status) === "Submitted"
    ) {
      return NextResponse.json(
        { error: "Application already submitted" },
        { status: 400 },
      );
    }

    const { applicationId, documentType } = await request.json();

    if (!applicationId || !documentType) {
      return NextResponse.json(
        { error: "Missing applicationId or documentType" },
        { status: 400 },
      );
    }

    if (applicationId !== application.id) {
      return NextResponse.json(
        { error: "Invalid application" },
        { status: 403 },
      );
    }

    const validTypes = ["CV", "Transcript", "Video"];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 },
      );
    }

    // Delete from database and get the file path
    const result = await deleteDocument(applicationId, documentType);

    if (result.success && result.filePath) {
      // Extract Google Drive file ID and delete from Drive
      const match = result.filePath.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        await deleteFileFromDrive(match[1]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
