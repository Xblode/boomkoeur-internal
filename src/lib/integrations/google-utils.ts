/**
 * Utilitaires pour extraire les IDs des URLs Google Docs, Sheets, Drive.
 */

/** Extrait l'ID d'un Google Doc depuis une URL docs.google.com ou drive.google.com */
export function parseGoogleDocId(url: string): string | null {
  if (!url?.trim()) return null;
  const m = url.match(/docs\.google\.com\/document\/d\/([^/?#]+)/);
  if (m) return m[1];
  const m2 = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  return m2 ? m2[1] : null;
}

/** Extrait l'ID d'un Google Sheet depuis une URL docs.google.com ou drive.google.com */
export function parseGoogleSheetId(url: string): string | null {
  if (!url?.trim()) return null;
  const m = url.match(/docs\.google\.com\/spreadsheets\/d\/([^/?#]+)/);
  if (m) return m[1];
  const m2 = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  return m2 ? m2[1] : null;
}

/** Extrait l'ID d'un fichier Drive depuis une URL drive.google.com */
export function parseDriveFileId(url: string): string | null {
  if (!url?.trim()) return null;
  const m = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  return m ? m[1] : null;
}

/** Détecte si l'URL pointe vers un Google Doc */
export function isGoogleDocUrl(url: string): boolean {
  return url.includes('docs.google.com/document');
}

/** Détecte si l'URL pointe vers un Google Sheet */
export function isGoogleSheetUrl(url: string): boolean {
  return url.includes('docs.google.com/spreadsheets');
}
