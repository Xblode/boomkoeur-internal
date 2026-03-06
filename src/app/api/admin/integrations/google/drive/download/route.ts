import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDriveClient } from '@/lib/integrations/google';
import { parseDriveFileId } from '@/lib/integrations/google-utils';

const GOOGLE_APP_MIMES: Record<string, string> = {
  'application/vnd.google-apps.document': 'application/pdf',
  'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.google-apps.presentation': 'application/pdf',
};

const EXPORT_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

async function ensureOrgAdmin(orgId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Non authentifié', status: 401 };
  }

  const { data } = await supabase.rpc('is_org_admin', {
    uid: user.id,
    oid: orgId,
  });
  if (!data) {
    return { error: "Accès réservé aux administrateurs de l'organisation", status: 403 };
  }
  return null;
}

/**
 * Télécharge un fichier Google Drive (natif ou export Google Docs/Sheets/Slides).
 * Utilise Content-Disposition: attachment pour forcer le téléchargement.
 */
export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  const fileId = request.nextUrl.searchParams.get('file_id');
  const url = request.nextUrl.searchParams.get('url');
  const filename = request.nextUrl.searchParams.get('filename') || 'document';

  const resolvedFileId = fileId ?? (url ? parseDriveFileId(url) : null);

  if (!orgId || !resolvedFileId) {
    return NextResponse.json({ error: 'org_id et file_id (ou url) requis' }, { status: 400 });
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const drive = await getDriveClient(orgId);
  if (!drive) {
    return NextResponse.json(
      { error: 'Google Drive non connecté pour cette organisation' },
      { status: 400 }
    );
  }

  try {
    const metadata = await drive.files.get({
      fileId: resolvedFileId,
      fields: 'mimeType,name',
    });
    const mimeType = metadata.data.mimeType ?? 'application/octet-stream';
    const originalName = (metadata.data.name as string) || filename;

    const exportMime = GOOGLE_APP_MIMES[mimeType];
    let buffer: ArrayBuffer;
    let contentType: string;
    let ext: string;

    if (exportMime) {
      const exportRes = await drive.files.export(
        { fileId: resolvedFileId, mimeType: exportMime },
        { responseType: 'arraybuffer' }
      );
      buffer = exportRes.data as ArrayBuffer;
      contentType = exportMime;
      ext = EXPORT_EXT[exportMime] ?? '.pdf';
    } else {
      const response = await drive.files.get(
        { fileId: resolvedFileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      buffer = response.data as ArrayBuffer;
      contentType = mimeType;
      ext = mimeType === 'application/pdf' ? '.pdf' : '';
    }

    if (!buffer || buffer.byteLength === 0) {
      return NextResponse.json({ error: 'Fichier vide' }, { status: 404 });
    }

    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const downloadName = safeName.includes('.') ? safeName : `${safeName}${ext}`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[Drive download] Error:', err);
    return NextResponse.json(
      { error: 'Impossible de télécharger le fichier' },
      { status: 500 }
    );
  }
}
