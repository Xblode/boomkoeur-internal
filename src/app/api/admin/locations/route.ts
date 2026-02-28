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
  return { supabase, user };
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
    .from('organisation_locations')
    .select('id, org_id, address, name, city, created_at, updated_at')
    .eq('org_id', orgId)
    .order('city', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Locations GET error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des lieux' },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  let body: { org_id: string; address: string; name?: string; city?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { org_id, address, name, city } = body;
  if (!org_id || !address?.trim()) {
    return NextResponse.json(
      { error: 'org_id et address requis' },
      { status: 400 }
    );
  }

  const auth = await ensureOrgAdmin(org_id);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from('organisation_locations')
    .insert({
      org_id,
      address: address.trim(),
      name: name?.trim() || null,
      city: city?.trim() || null,
    })
    .select('id, org_id, address, name, city, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Cette adresse existe déjà pour cette organisation' },
        { status: 409 }
      );
    }
    console.error('Locations POST error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du lieu' },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
