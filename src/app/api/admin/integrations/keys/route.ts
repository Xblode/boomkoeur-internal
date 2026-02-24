import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createApiKey } from '@/lib/supabase/integrations';

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
  return { supabase };
}

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const auth = await ensureOrgAdmin(orgId);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from('organisation_api_keys')
    .select('id, name, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Erreur lors du chargement' }, { status: 500 });
  }

  return NextResponse.json({
    keys: (data ?? []).map((k) => ({
      id: k.id,
      name: k.name,
      created_at: k.created_at,
    })),
  });
}

export async function POST(request: NextRequest) {
  let body: { org_id: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { org_id, name } = body;
  if (!org_id) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const auth = await ensureOrgAdmin(org_id);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { key, id } = await createApiKey(auth.supabase, org_id, name?.trim() || 'Clé par défaut');
    return NextResponse.json({
      id,
      key,
      message: 'Cette clé ne sera plus affichée. Copiez-la maintenant.',
    });
  } catch (err) {
    console.error('Create API key error:', err);
    return NextResponse.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  const keyId = request.nextUrl.searchParams.get('key_id');
  if (!orgId || !keyId) {
    return NextResponse.json({ error: 'org_id et key_id requis' }, { status: 400 });
  }

  const auth = await ensureOrgAdmin(orgId);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { error } = await auth.supabase
    .from('organisation_api_keys')
    .delete()
    .eq('id', keyId)
    .eq('org_id', orgId);

  if (error) {
    console.error('Delete API key error:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
