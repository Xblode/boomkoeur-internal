import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const orgId = body.org_id as string | undefined;
  const raw = body.google_calendar_id;

  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const supabase = await createClient();
  let value: string | null | undefined = undefined;
  if (raw !== undefined) {
    if (Array.isArray(raw)) {
      value = raw.filter((id: unknown) => typeof id === 'string' && id.trim()).join(',') || null;
    } else if (typeof raw === 'string') {
      value = raw.trim() || null;
    } else {
      value = null;
    }
  }

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (value !== undefined) payload.google_calendar_id = value;

  const { error } = await supabase
    .from('organisations')
    .update(payload)
    .eq('id', orgId);

  if (error) {
    console.error('Calendar config update error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
