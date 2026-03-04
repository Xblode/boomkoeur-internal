import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getInstagramMediaById } from '@/lib/integrations/meta';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: mediaId } = await params;
  const orgId = request.nextUrl.searchParams.get('org_id');

  if (!orgId || !mediaId) {
    return NextResponse.json({ error: 'org_id et id du média requis' }, { status: 400 });
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const media = await getInstagramMediaById(orgId, mediaId);

  if (!media) {
    return NextResponse.json(
      { error: 'Média introuvable ou accès refusé' },
      { status: 404 }
    );
  }

  return NextResponse.json(media);
}
