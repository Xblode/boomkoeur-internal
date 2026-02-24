import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getInstagramMedia } from '@/lib/integrations/meta';

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
  const limit = request.nextUrl.searchParams.get('limit');
  const after = request.nextUrl.searchParams.get('after');

  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const result = await getInstagramMedia(orgId, {
    limit: limit ? parseInt(limit, 10) : 25,
    after: after ?? undefined,
  });

  if (!result.success) {
    const message =
      result.reason === 'no_credentials'
        ? 'Meta non connecté pour cette organisation'
        : result.details ?? 'Erreur lors du chargement Instagram';
    return NextResponse.json(
      { error: message, reason: result.reason, details: result.details, isTransient: result.isTransient },
      { status: 400 }
    );
  }

  return NextResponse.json({ data: result.data, paging: result.paging });
}
