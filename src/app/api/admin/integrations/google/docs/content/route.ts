import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDriveClient } from '@/lib/integrations/google';
import { parseGoogleDocId } from '@/lib/integrations/google-utils';

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

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  const documentId = request.nextUrl.searchParams.get('document_id');
  const url = request.nextUrl.searchParams.get('url');

  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const docId = documentId ?? (url ? parseGoogleDocId(url) : null);
  if (!docId) {
    return NextResponse.json(
      { error: 'document_id ou url (Google Doc) requis' },
      { status: 400 }
    );
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const drive = await getDriveClient(orgId);
  if (!drive) {
    return NextResponse.json(
      {
        error:
          'Google Drive non connecté. Configurez l\'intégration dans Administration > Intégrations.',
      },
      { status: 400 }
    );
  }

  try {
    const response = await drive.files.export({
      fileId: docId,
      mimeType: 'text/plain',
    });

    const content =
      typeof response.data === 'string'
        ? response.data
        : Buffer.isBuffer(response.data)
          ? response.data.toString('utf-8')
          : '';

    return NextResponse.json({ content });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur lors du chargement du document';
    console.error('Docs content error:', err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
