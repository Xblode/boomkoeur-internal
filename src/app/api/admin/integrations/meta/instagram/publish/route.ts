import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { publishInstagramImage } from '@/lib/integrations/meta';

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

export async function POST(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');

  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  let body: { image_url: string; caption?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { image_url, caption } = body;
  if (!image_url?.trim()) {
    return NextResponse.json({ error: 'image_url requis' }, { status: 400 });
  }

  const result = await publishInstagramImage(orgId, image_url.trim(), caption?.trim());

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ id: result.id, success: true });
}
