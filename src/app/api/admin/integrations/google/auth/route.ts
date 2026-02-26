import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOAuthState } from '@/lib/integrations/google-oauth';
import { getOrgIntegration } from '@/lib/supabase/integrations';
import type { GoogleCredentials } from '@/lib/supabase/integrations';
import { google } from 'googleapis';

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

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

  const orgConfig = await getOrgIntegration<GoogleCredentials>(auth.supabase, orgId, 'google');
  const clientId = orgConfig?.client_id?.trim() || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = orgConfig?.client_secret?.trim() || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = orgConfig?.redirect_uri?.trim() || defaultRedirectUri;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          'Configuration Google manquante. Configurez Client ID et Secret dans Paramètres, ou définissez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.',
      },
      { status: 500 }
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const state = createOAuthState(orgId, clientSecret);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_SCOPES,
    state,
  });

  return NextResponse.redirect(authUrl);
}
