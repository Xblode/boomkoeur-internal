import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createMetaOAuthState } from '@/lib/integrations/meta-oauth';
import { getOrgIntegration } from '@/lib/supabase/integrations';
import type { MetaConfigCredentials } from '@/lib/supabase/integrations';

// Instagram API with Instagram Login (Business Login)
// Meta for Developers > Instagram > API setup with Instagram login > Business login settings
const INSTAGRAM_OAUTH_URL = 'https://api.instagram.com/oauth/authorize';
const OAUTH_CLOSE = '/oauth-close.html';

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
  return { supabase };
}

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  if (!orgId) {
    const url = new URL(OAUTH_CLOSE, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
    url.searchParams.set('error', 'org_id requis');
    return NextResponse.redirect(url);
  }

  const auth = await ensureOrgAdmin(orgId);
  if ('error' in auth) {
    const url = new URL(OAUTH_CLOSE, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
    url.searchParams.set('error', auth.error ?? 'Accès refusé');
    return NextResponse.redirect(url);
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  ).replace(/\/+$/, '');
  const defaultRedirectUri = `${baseUrl}/api/admin/integrations/meta/callback`;

  const orgConfig = await getOrgIntegration<MetaConfigCredentials>(
    auth.supabase,
    orgId,
    'meta_config'
  );
  const clientId =
    orgConfig?.insta_client_id?.trim() || process.env.INSTA_CLIENT_ID;
  const clientSecret =
    orgConfig?.insta_client_secret?.trim() || process.env.INSTA_CLIENT_SECRET;
  const rawRedirect =
    orgConfig?.insta_redirect_uri?.trim() ||
    process.env.INSTA_REDIRECT_URI ||
    defaultRedirectUri;
  const redirectUri = rawRedirect.replace(/\/+$/, '');

  if (!clientId || !clientSecret) {
    const url = new URL(OAUTH_CLOSE, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
    url.searchParams.set(
      'error',
      'Configuration Instagram manquante. Configurez App ID et Secret dans Paramètres, ou définissez INSTA_CLIENT_ID et INSTA_CLIENT_SECRET.'
    );
    return NextResponse.redirect(url);
  }

  const state = createMetaOAuthState(orgId, clientSecret);
  // Permissions pour Instagram API with Instagram Login (Business Login)
  const scopes = [
    'instagram_business_basic',
    'instagram_business_content_publish',
    'instagram_business_manage_insights',
  ].join(',');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: scopes,
    response_type: 'code',
    force_reauth: 'true', // Force l'écran de connexion pour choisir le compte Instagram
  });

  return NextResponse.redirect(`${INSTAGRAM_OAUTH_URL}?${params.toString()}`);
}
