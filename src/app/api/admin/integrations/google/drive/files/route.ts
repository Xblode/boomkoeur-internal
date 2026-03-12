import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDriveClient } from '@/lib/integrations/google';

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
    return { error: 'Accès réservé aux administrateurs de l\'organisation', status: 403 };
  }
  return null;
}

async function fetchFolderContents(
  drive: Awaited<ReturnType<typeof getDriveClient>>,
  folderId: string | null,
  pageToken?: string | null
): Promise<{ files: Array<{ id: string; name: string; mimeType: string; webViewLink: string; thumbnailLink?: string; isFolder: boolean }>; nextPageToken: string | null }> {
  const mimeFilter = "(mimeType contains 'image/' or mimeType contains 'video/' or mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/pdf')";
  const ownerFilter = `'me' in owners`;

  let q: string;
  let fields = 'nextPageToken, files(id, name, mimeType, webViewLink, thumbnailLink)';

  if (folderId === 'computers') {
    q = `trashed = false and ${ownerFilter} and mimeType = 'application/vnd.google-apps.folder'`;
    fields = 'nextPageToken, files(id, name, mimeType, webViewLink, parents)';
  } else {
    const parentsFilter = folderId ? `'${folderId}' in parents` : `'root' in parents`;
    q = `${parentsFilter} and ${ownerFilter} and trashed = false and ${mimeFilter}`;
  }

  const params: Record<string, unknown> = {
    q,
    spaces: 'drive',
    pageSize: 50,
    fields,
    orderBy: 'modifiedTime desc',
  };
  if (pageToken) params.pageToken = pageToken;

  const response = await drive!.files.list(params);
  const list = response.data;
  let rawFiles = list?.files ?? [];

  if (folderId === 'computers') {
    rawFiles = rawFiles.filter((f) => !f.parents || f.parents.length === 0);
  }

  const files = rawFiles.map((f) => ({
    id: f.id!,
    name: f.name ?? '',
    mimeType: f.mimeType ?? '',
    webViewLink: f.webViewLink ?? `https://drive.google.com/file/d/${f.id}/view`,
    thumbnailLink: f.thumbnailLink ?? undefined,
    isFolder: f.mimeType === 'application/vnd.google-apps.folder',
  }));

  return { files, nextPageToken: list?.nextPageToken ?? null };
}

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  const folderId = request.nextUrl.searchParams.get('folder_id');
  const folderIds = request.nextUrl.searchParams.get('folder_ids');
  const pageToken = request.nextUrl.searchParams.get('page_token');

  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const drive = await getDriveClient(orgId);
  if (!drive) {
    return NextResponse.json(
      { error: 'Google Drive non connecté. Configurez l\'intégration dans Administration > Intégrations.' },
      { status: 400 }
    );
  }

  try {
    // Mode batch : charger plusieurs dossiers en une requête
    if (folderIds) {
      const ids = folderIds.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length === 0) {
        return NextResponse.json({ error: 'folder_ids requis' }, { status: 400 });
      }
      const results = await Promise.all(
        ids.map(async (id) => {
          const { files, nextPageToken } = await fetchFolderContents(drive, id, undefined);
          return { id, files, nextPageToken };
        })
      );
      const byId: Record<string, { files: typeof results[0]['files']; nextPageToken: string | null }> = {};
      for (const r of results) {
        byId[r.id] = { files: r.files, nextPageToken: r.nextPageToken };
      }
      return NextResponse.json({ results: byId });
    }

    // Mode single (comportement existant)
    const { files, nextPageToken } = await fetchFolderContents(drive, folderId, pageToken);
    return NextResponse.json({ files, nextPageToken });
  } catch (err) {
    console.error('Drive API error:', err);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du Drive' },
      { status: 500 }
    );
  }
}
