import { google } from "googleapis";
import { Readable } from "stream";

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Google OAuth2 credentials. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.",
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

function getDriveClient() {
  const auth = getAuth();
  return google.drive({ version: "v3", auth });
}

export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  subfolder?: string,
): Promise<{ fileId: string; webViewLink: string }> {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is not set");
  }

  let parentFolderId = folderId;

  // Create subfolder if specified
  if (subfolder) {
    parentFolderId = await getOrCreateFolder(drive, subfolder, folderId);
  }

  const fileMetadata = {
    name: fileName,
    parents: [parentFolderId],
  };

  const media = {
    mimeType,
    body: Readable.from(fileBuffer),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, webViewLink",
  });

  // Make file viewable by anyone with the link
  await drive.permissions.create({
    fileId: response.data.id!,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return {
    fileId: response.data.id!,
    webViewLink:
      response.data.webViewLink ||
      `https://drive.google.com/file/d/${response.data.id}/view`,
  };
}

export async function deleteFileFromDrive(fileId: string): Promise<void> {
  try {
    const drive = getDriveClient();
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error("Error deleting file from Drive:", error);
  }
}

async function getOrCreateFolder(
  drive: ReturnType<typeof google.drive>,
  folderName: string,
  parentId: string,
): Promise<string> {
  // Check if folder already exists
  const existing = await drive.files.list({
    q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  });

  if (existing.data.files && existing.data.files.length > 0) {
    return existing.data.files[0].id!;
  }

  // Create new folder
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });

  return folder.data.id!;
}
