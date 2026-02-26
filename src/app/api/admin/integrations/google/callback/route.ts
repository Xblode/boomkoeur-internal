import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAndParseOAuthStateWithOrgSecret } from '@/lib/integrations/google-oauth';
import { getOrgIntegration, getOrgIntegrationWithAdmin, upsertOrgIntegration } from '@/lib/supabase/integrations';
import type { GoogleCredentials } from '@/lib/supabase/integrations';
import { google } from 'googleapis';

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
    return { error: 'Accès réservé aux administrateurs de l\'organisation', status: 403 };
  }
  return { supabase, user };
}

function redirectWithError(error: string) {
  const url = new URL(OAUTH_CLOSE, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
  url.searchParams.set('error', error);
  return NextResponse.redirect(url);
}

function redirectWithSuccess() {
  const url = new URL(OAUTH_CLOSE, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
  url.searchParams.set('success', 'google');
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  if (errorParam) {
    return redirectWithError(
      errorParam === 'access_denied' ? 'Connexion Google annulée' : `Erreur Google: ${errorParam}`
    );
  }

  if (!code || !state) {
    return redirectWithError('Paramètres OAuth manquants');
  }

  const parsed = await verifyAndParseOAuthStateWithOrgSecret(state, async (oid) => {
    const config = await getOrgIntegrationWithAdmin<GoogleCredentials>(oid, 'google');
    return config?.client_secret ?? null;
  });
  if (!parsed) {
    return redirectWithError(
      'Session expirée ou lien invalide. Fermez la fenêtre et réessayez de connecter Google.'
    );
  }

  const auth = await ensureOrgAdmin(parsed.org_id);
  if ('error' in auth) {
    return redirectWithError(auth.error ?? 'Accès refusé');
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  ).replace(/\/+$/, '');
  const defaultRedirectUri = `${baseUrl}/api/admin/integrations/google/callback`;

  const orgConfig = await getOrgIntegration<GoogleCredentials>(auth.supabase, parsed.org_id, 'google');
  const clientId = orgConfig?.client_id?.trim() || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = orgConfig?.client_secret?.trim() || process.env.GOOGLE_CLIENT_SECRET;
  const rawRedirect = orgConfig?.redirect_uri?.trim() || defaultRedirectUri;
  const redirectUri = rawRedirect.replace(/\/+$/, '');

  if (!clientId || !clientSecret) {
    return redirectWithError(
      'Configuration Google manquante. Configurez Client ID et Secret dans Paramètres.'
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token || !tokens.refresh_token) {
      return redirectWithError('Tokens Google non reçus');
    }

    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    const email = userInfo?.email ?? undefined;

    const credentials: GoogleCredentials = {
      ...orgConfig,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiry_date ?? Date.now() + 3600 * 1000,
      email,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    };

    await upsertOrgIntegration(auth.supabase, parsed.org_id, 'google', credentials);
    return redirectWithSuccess();
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return redirectWithError('Erreur lors de la connexion Google');
  }
}
