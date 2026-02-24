import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createMetaOAuthState } from '@/lib/integrations/meta-oauth';

// Instagram API with Instagram Login (OAuth Instagram, pas Facebook)
// Utilisez META_CLIENT_ID = Instagram App ID depuis Dashboard > Instagram > Business login settings
const INSTAGRAM_OAUTH_URL = 'https://www.instagram.com/oauth/authorize';
const DASHBOARD_INTEGRATION = '/dashboard/admin/integration';

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
  if (!orgId) {
    const url = new URL(DASHBOARD_INTEGRATION, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
    url.searchParams.set('error', 'org_id requis');
    return NextResponse.redirect(url);
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    const url = new URL(DASHBOARD_INTEGRATION, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
    url.searchParams.set('error', authError.error ?? 'Accès refusé');
    return NextResponse.redirect(url);
  }

  const clientId = process.env.INSTA_CLIENT_ID;
  const redirectUri =
    process.env.INSTA_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`}/api/admin/integrations/meta/callback`;

  if (!clientId) {
    const url = new URL(DASHBOARD_INTEGRATION, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
    url.searchParams.set('error', 'Configuration Instagram manquante (INSTA_CLIENT_ID)');
    return NextResponse.redirect(url);
  }

  const state = createMetaOAuthState(orgId);
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
