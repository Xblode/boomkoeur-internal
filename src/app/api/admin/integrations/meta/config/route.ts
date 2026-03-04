import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getOrgIntegration,
  upsertOrgIntegration,
  type MetaConfigCredentials,
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

/** GET : retourne la config Instagram (sans le secret) */
export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const auth = await ensureOrgAdmin(orgId);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  ).replace(/\/+$/, '');
  const defaultRedirectUri = `${baseUrl}/api/admin/integrations/meta/callback`;

  const config = await getOrgIntegration<MetaConfigCredentials>(
    auth.supabase,
    orgId,
    'meta_config'
  );
  if (!config) {
    return NextResponse.json({
      insta_client_id: '',
      insta_redirect_uri: defaultRedirectUri,
      has_config: false,
    });
  }

  return NextResponse.json({
    insta_client_id: config.insta_client_id ?? '',
    insta_redirect_uri: config.insta_redirect_uri ?? defaultRedirectUri,
    has_config: !!(config.insta_client_id && config.insta_client_secret),
  });
}

/** PATCH : enregistre la config OAuth Instagram (App ID, Secret, URI) */
export async function PATCH(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const auth = await ensureOrgAdmin(orgId);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: {
    insta_client_id?: string;
    insta_client_secret?: string;
    insta_redirect_uri?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { insta_client_id, insta_client_secret, insta_redirect_uri } = body;

  const existing = await getOrgIntegration<MetaConfigCredentials>(
    auth.supabase,
    orgId,
    'meta_config'
  );

  const merged: MetaConfigCredentials = {
    insta_client_id: insta_client_id?.trim() ?? existing?.insta_client_id ?? '',
    insta_client_secret:
      insta_client_secret !== undefined && insta_client_secret !== ''
        ? insta_client_secret.trim()
        : existing?.insta_client_secret ?? '',
    insta_redirect_uri: insta_redirect_uri?.trim() ?? existing?.insta_redirect_uri ?? '',
  };

  if (!merged.insta_client_id || !merged.insta_client_secret) {
    return NextResponse.json(
      { error: 'Client ID et Client Secret Instagram sont requis' },
      { status: 400 }
    );
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  ).replace(/\/+$/, '');
  if (!merged.insta_redirect_uri) {
    merged.insta_redirect_uri = `${baseUrl}/api/admin/integrations/meta/callback`;
  } else {
    merged.insta_redirect_uri = merged.insta_redirect_uri.replace(/\/+$/, '');
  }

  try {
    await upsertOrgIntegration(auth.supabase, orgId, 'meta_config', merged);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Meta config save error:', err);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }
}
