import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getOrgIntegration,
  upsertOrgIntegration,
  type GoogleCredentials,
} from '@/lib/supabase/integrations';

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

/** GET : retourne la config Google (sans le secret) */
export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const auth = await ensureOrgAdmin(orgId);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
  const defaultRedirectUri = `${baseUrl}/api/admin/integrations/google/callback`;

  const config = await getOrgIntegration<GoogleCredentials>(auth.supabase, orgId, 'google');
  if (!config) {
    return NextResponse.json({
      client_id: '',
      redirect_uri: defaultRedirectUri,
      has_config: false,
    });
  }

  return NextResponse.json({
    client_id: config.client_id ?? '',
    redirect_uri: config.redirect_uri ?? defaultRedirectUri,
    has_config: !!(config.client_id && config.client_secret),
  });
}

/** PATCH : enregistre la config OAuth (Client ID, Secret, URI) */
export async function PATCH(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const auth = await ensureOrgAdmin(orgId);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { client_id?: string; client_secret?: string; redirect_uri?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { client_id, client_secret, redirect_uri } = body;

  const existing = await getOrgIntegration<GoogleCredentials>(auth.supabase, orgId, 'google');

  const merged: GoogleCredentials = {
    ...existing,
    client_id: client_id?.trim() ?? existing?.client_id ?? '',
    client_secret:
      client_secret !== undefined && client_secret !== ''
        ? client_secret.trim()
        : existing?.client_secret ?? '',
    redirect_uri: redirect_uri?.trim() ?? existing?.redirect_uri ?? '',
  };

  if (!merged.client_id || !merged.client_secret) {
    return NextResponse.json(
      { error: 'Client ID et Client Secret sont requis' },
      { status: 400 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
  if (!merged.redirect_uri) {
    merged.redirect_uri = `${baseUrl}/api/admin/integrations/google/callback`;
  }

  try {
    await upsertOrgIntegration(auth.supabase, orgId, 'google', merged);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Google config save error:', err);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }
}
