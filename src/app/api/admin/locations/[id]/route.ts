import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function ensureOrgAdminForLocation(supabase: Awaited<ReturnType<typeof createClient>>, locationId: string) {
  const { data: location } = await supabase
    .from('organisation_locations')
    .select('org_id')
    .eq('id', locationId)
    .single();

  if (!location?.org_id) {
    return { error: 'Lieu introuvable', status: 404 };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Non authentifié', status: 401 };
  }

  const { data } = await supabase.rpc('is_org_admin', {
    uid: user.id,
    oid: location.org_id,
  });
  if (!data) {
    return { error: "Accès réservé aux administrateurs de l'organisation", status: 403 };
  }
  return { supabase, orgId: location.org_id };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  }

  const auth = await ensureOrgAdminForLocation(supabase, id);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { address?: string; name?: string; city?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const updates: Record<string, string | null> = {};
  if (body.address !== undefined) updates.address = body.address?.trim() || null;
  if (body.name !== undefined) updates.name = body.name?.trim() || null;
  if (body.city !== undefined) updates.city = body.city?.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Aucune modification fournie' }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from('organisation_locations')
    .update(updates)
    .eq('id', id)
    .select('id, org_id, address, name, city, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Cette adresse existe déjà pour cette organisation' },
        { status: 409 }
      );
    }
    console.error('Locations PATCH error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du lieu' },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  }

  const auth = await ensureOrgAdminForLocation(supabase, id);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { error } = await auth.supabase
    .from('organisation_locations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Locations DELETE error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du lieu' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
