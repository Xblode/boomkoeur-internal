import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDriveClient } from '@/lib/integrations/google';
import { parseDriveFileId } from '@/lib/integrations/google-utils';

async function ensureOrgMember(orgId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Non authentifié', status: 401 };
  }

  // user_belongs_to_org utilise auth.uid() en interne, ne prend que oid
  const { data } = await supabase.rpc('user_belongs_to_org', {
    oid: orgId,
  });
  if (!data) {
    return { error: "Accès réservé aux membres de l'organisation", status: 403 };
  }
  return null;
}

/**
 * Proxy pour afficher les images Google Drive dans les prévisualisations.
 * Google Drive bloque l'affichage direct dans <img> (CORS, redirections).
 * Cette route récupère le fichier via l'API Drive et le stream.
 */
export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  const fileId = request.nextUrl.searchParams.get('file_id');
  const url = request.nextUrl.searchParams.get('url');

  const resolvedFileId = fileId ?? (url ? parseDriveFileId(url) : null);

  if (!orgId || !resolvedFileId) {
    return NextResponse.json({ error: 'org_id et file_id (ou url) requis' }, { status: 400 });
  }

  const authError = await ensureOrgMember(orgId);
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
      fields: 'mimeType',
    });
    const mimeType = metadata.data.mimeType ?? 'image/jpeg';

    const response = await drive.files.get(
      { fileId: resolvedFileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    const buffer = response.data as ArrayBuffer;
    if (!buffer || buffer.byteLength === 0) {
      return NextResponse.json({ error: 'Fichier vide' }, { status: 404 });
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[Drive proxy] Error:', err);
    return NextResponse.json(
      { error: 'Impossible de récupérer le fichier' },
      { status: 500 }
    );
  }
}
