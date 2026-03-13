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

export async function createDriveResumableUploadSession(
  fileName: string,
  mimeType: string,
  fileSize: number,
  subfolder?: string,
): Promise<{ uploadUrl: string }> {
  const auth = getAuth();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is not set");
  }

  const drive = google.drive({ version: "v3", auth });
  let parentFolderId = folderId;

  if (subfolder) {
    parentFolderId = await getOrCreateFolder(drive, subfolder, folderId);
  }

  const accessToken = await auth.getAccessToken();
  if (!accessToken?.token) {
    throw new Error("Failed to obtain Google access token");
  }

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": String(fileSize),
      },
      body: JSON.stringify({
        name: fileName,
        parents: [parentFolderId],
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to create upload session: ${body}`);
  }

  const uploadUrl = response.headers.get("location");
  if (!uploadUrl) {
    throw new Error("Missing resumable upload session URL");
  }

  return { uploadUrl };
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

  // // Make file viewable by anyone with the link
  // await drive.permissions.create({
  //   fileId: response.data.id!,
  //   requestBody: {
  //     role: "reader",
  //     type: "anyone",
  //   },
  // });

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

export async function getDriveFileMetadata(fileId: string): Promise<{
  id: string;
  name: string;
  mimeType: string;
  size: number;
}> {
  const drive = getDriveClient();
  const response = await drive.files.get({
    fileId,
    fields: "id,name,mimeType,size",
  });

  return {
    id: response.data.id || fileId,
    name: response.data.name || "",
    mimeType: response.data.mimeType || "",
    size: Number(response.data.size || 0),
  };
}

export async function findLatestDriveFileByNameInSubfolder(
  fileName: string,
  subfolder: string,
): Promise<{
  id: string;
  name: string;
  mimeType: string;
  size: number;
} | null> {
  const drive = getDriveClient();
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!rootFolderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is not set");
  }

  const escapedSubfolder = subfolder.replace(/'/g, "\\'");
  const folderRows = await drive.files.list({
    q: `name='${escapedSubfolder}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
    pageSize: 1,
  });

  const folderId = folderRows.data.files?.[0]?.id;
  if (!folderId) {
    return null;
  }

  const escapedFileName = fileName.replace(/'/g, "\\'");
  const fileRows = await drive.files.list({
    q: `name='${escapedFileName}' and '${folderId}' in parents and trashed=false`,
    fields: "files(id,name,mimeType,size,createdTime)",
    orderBy: "createdTime desc",
    pageSize: 1,
  });

  const file = fileRows.data.files?.[0];
  if (!file?.id) {
    return null;
  }

  return {
    id: file.id,
    name: file.name || fileName,
    mimeType: file.mimeType || "",
    size: Number(file.size || 0),
  };
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
