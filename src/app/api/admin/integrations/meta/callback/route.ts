import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAndParseMetaOAuthState } from '@/lib/integrations/meta-oauth';
import { upsertOrgIntegration } from '@/lib/supabase/integrations';
import type { MetaCredentials } from '@/lib/supabase/integrations';

const OAUTH_CLOSE = '/oauth-close.html';
const INSTAGRAM_OAUTH_API = 'https://api.instagram.com/oauth';
const GRAPH_IG_API = 'https://graph.instagram.com';

function redirectWithError(error: string) {
  const url = new URL(OAUTH_CLOSE, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
  url.searchParams.set('error', error);
  return NextResponse.redirect(url);
}

function redirectWithSuccess() {
  const url = new URL(OAUTH_CLOSE, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
  url.searchParams.set('success', 'meta');
  return NextResponse.redirect(url);
}

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
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  if (errorParam) {
    return redirectWithError(
      errorParam === 'access_denied' ? 'Connexion Meta annulée' : `Erreur Meta: ${errorParam}`
    );
  }

  if (!code || !state) {
    return redirectWithError('Paramètres OAuth manquants');
  }

  const parsed = verifyAndParseMetaOAuthState(state);
  if (!parsed) {
    return redirectWithError('State OAuth invalide');
  }

  const auth = await ensureOrgAdmin(parsed.org_id);
  if ('error' in auth) {
    return redirectWithError(auth.error ?? 'Accès refusé');
  }

  const clientId = process.env.INSTA_CLIENT_ID;
  const clientSecret = process.env.INSTA_CLIENT_SECRET;
  const redirectUri =
    process.env.INSTA_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`}/api/admin/integrations/meta/callback`;

  if (!clientId || !clientSecret) {
    return redirectWithError('Configuration Instagram manquante (INSTA_CLIENT_ID, INSTA_CLIENT_SECRET)');
  }

  try {
    // 1. Exchange code for short-lived Instagram User access token (Instagram API with Instagram Login)
    const tokenForm = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    });

    const tokenRes = await fetch(`${INSTAGRAM_OAUTH_API}/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenForm.toString(),
    });

    const tokenData = (await tokenRes.json()) as
      | { data?: Array<{ access_token: string; user_id: string }>; access_token?: string; user_id?: string; error?: { message: string } };

    let shortLivedToken: string;
    let igUserId: string;

    if (tokenData.error) {
      console.error('Instagram token exchange error:', tokenData);
      return redirectWithError(tokenData.error?.message ?? 'Échec de l\'échange de code');
    }

    // Réponse peut être { data: [{ access_token, user_id }] } ou { access_token, user_id }
    if (tokenData.data?.[0]) {
      shortLivedToken = tokenData.data[0].access_token;
      igUserId = tokenData.data[0].user_id;
    } else if (tokenData.access_token && tokenData.user_id) {
      shortLivedToken = tokenData.access_token;
      igUserId = String(tokenData.user_id);
    } else {
      return redirectWithError('Réponse token Instagram invalide');
    }

    // 2. Exchange for long-lived token (60 days)
    const longLivedUrl = new URL(`${GRAPH_IG_API}/access_token`);
    longLivedUrl.searchParams.set('grant_type', 'ig_exchange_token');
    longLivedUrl.searchParams.set('client_secret', clientSecret);
    longLivedUrl.searchParams.set('access_token', shortLivedToken);

    const longLivedRes = await fetch(longLivedUrl.toString());
    const longLivedData = (await longLivedRes.json()) as {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
      error?: { message: string };
    };

    const accessToken = longLivedData.access_token ?? shortLivedToken;

    // 3. Récupérer le username Instagram
    const userRes = await fetch(
      `${GRAPH_IG_API}/${igUserId}?fields=username&access_token=${encodeURIComponent(accessToken)}`
    );
    const userData = (await userRes.json()) as { username?: string; error?: { message: string } };
    const igUsername = userData.username;

    const credentials: MetaCredentials = {
      access_token: accessToken,
      ig_user_id: igUserId,
      ig_username: igUsername,
    };

    await upsertOrgIntegration(auth.supabase, parsed.org_id, 'meta', credentials);
    return redirectWithSuccess();
  } catch (err) {
    console.error('Meta OAuth callback error:', err);
    return redirectWithError('Erreur lors de la connexion Meta');
  }
}
