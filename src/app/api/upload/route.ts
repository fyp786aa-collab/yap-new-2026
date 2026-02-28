import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getApplicationByUserId } from "@/lib/db-queries/applications";
import { uploadFileToDrive } from "@/lib/google-drive";
import { upsertDocument } from "@/lib/db-queries/sections";
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
    if (application.status === "Submitted") {
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
