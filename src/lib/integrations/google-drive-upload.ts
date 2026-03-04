/**
 * Utilitaires Google Drive : création de dossiers et upload de fichiers.
 */

import type { drive_v3 } from 'googleapis';
import { Readable } from 'stream';

const BILAN_FOLDER_NAME = 'Bilan Campagne';

/**
 * Crée un dossier à la racine (ou dans parentId) s'il n'existe pas, sinon retourne son id.
 */
export async function createOrGetFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string
): Promise<string> {
  const parent = parentId ?? 'root';
  const q = `name = '${name.replace(/'/g, "\\'")}' and '${parent}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const listRes = await drive.files.list({
    q,
    spaces: 'drive',
    fields: 'files(id, name)',
    pageSize: 1,
  });
  const existing = listRes.data.files?.[0];
  if (existing?.id) return existing.id;

  const createRes = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parent],
    },
    fields: 'id',
  });
  if (!createRes.data.id) throw new Error('Impossible de créer le dossier Drive');
  return createRes.data.id;
}

/**
 * Upload un buffer en tant que fichier dans un dossier Drive.
 * Retourne l'objet file avec webViewLink.
 */
export async function uploadFileToDrive(
  drive: drive_v3.Drive,
  buffer: Buffer,
  filename: string,
  mimeType: string,
  parentFolderId: string
): Promise<{ id: string; webViewLink?: string }> {
  const stream = Readable.from(buffer);
  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [parentFolderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink',
  });
  if (!res.data.id) throw new Error('Impossible d\'uploader le fichier sur Drive');
  const webViewLink =
    res.data.webViewLink ?? `https://drive.google.com/file/d/${res.data.id}/view`;
  return {
    id: res.data.id,
    webViewLink,
  };
}

export { BILAN_FOLDER_NAME };
