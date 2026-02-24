/**
 * Service Google - Drive et Gmail
 * Fournit des clients authentifiés avec refresh automatique des tokens.
 */

import { google } from 'googleapis';
import type { drive_v3, gmail_v1, docs_v1, sheets_v4, calendar_v3 } from 'googleapis';
import type { GoogleCredentials } from '@/lib/supabase/integrations';
import { encrypt, decrypt } from '@/lib/integrations/encryption';
import { createAdminClient } from '@/lib/supabase/admin';

const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 min avant expiration

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/admin/integrations/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET requis');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function getCredentialsForOrg(orgId: string): Promise<GoogleCredentials | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('organisation_integrations')
    .select('encrypted_credentials')
    .eq('org_id', orgId)
    .eq('provider', 'google')
    .maybeSingle();

  if (error || !data?.encrypted_credentials) return null;

  try {
    const plain = await decrypt(data.encrypted_credentials);
    return JSON.parse(plain) as GoogleCredentials;
  } catch {
    return null;
  }
}

async function refreshCredentialsIfNeeded(
  orgId: string,
  creds: GoogleCredentials
): Promise<GoogleCredentials> {
  const now = Date.now();
  if (creds.expires_at - TOKEN_EXPIRY_BUFFER_MS > now) {
    return creds;
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: creds.refresh_token,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  if (!credentials.access_token || !credentials.refresh_token) {
    throw new Error('Impossible de rafraîchir le token Google');
  }

  const updated: GoogleCredentials = {
    access_token: credentials.access_token,
    refresh_token: credentials.refresh_token ?? creds.refresh_token,
    expires_at: credentials.expiry_date ?? now + 3600 * 1000,
    email: creds.email,
  };

  const plain = JSON.stringify(updated);
  const encrypted = await encrypt(plain);
  const admin = createAdminClient();
  await admin
    .from('organisation_integrations')
    .update({
      encrypted_credentials: encrypted,
      updated_at: new Date().toISOString(),
    })
    .eq('org_id', orgId)
    .eq('provider', 'google');

  return updated;
}

/**
 * Retourne un client Drive v3 authentifié pour l'organisation.
 */
export async function getDriveClient(orgId: string): Promise<drive_v3.Drive | null> {
  const creds = await getCredentialsForOrg(orgId);
  if (!creds) return null;

  const fresh = await refreshCredentialsIfNeeded(orgId, creds);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: fresh.access_token,
    refresh_token: fresh.refresh_token,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Retourne un client Gmail v1 authentifié pour l'organisation.
 */
export async function getGmailClient(orgId: string): Promise<gmail_v1.Gmail | null> {
  const creds = await getCredentialsForOrg(orgId);
  if (!creds) return null;

  const fresh = await refreshCredentialsIfNeeded(orgId, creds);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: fresh.access_token,
    refresh_token: fresh.refresh_token,
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Retourne un client Docs v1 authentifié pour l'organisation.
 */
export async function getDocsClient(orgId: string): Promise<docs_v1.Docs | null> {
  const creds = await getCredentialsForOrg(orgId);
  if (!creds) return null;

  const fresh = await refreshCredentialsIfNeeded(orgId, creds);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: fresh.access_token,
    refresh_token: fresh.refresh_token,
  });

  return google.docs({ version: 'v1', auth: oauth2Client });
}

/**
 * Retourne un client Sheets v4 authentifié pour l'organisation.
 */
export async function getSheetsClient(orgId: string): Promise<sheets_v4.Sheets | null> {
  const creds = await getCredentialsForOrg(orgId);
  if (!creds) return null;

  const fresh = await refreshCredentialsIfNeeded(orgId, creds);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: fresh.access_token,
    refresh_token: fresh.refresh_token,
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

/**
 * Retourne un client Calendar v3 authentifié pour l'organisation.
 */
export async function getCalendarClient(orgId: string): Promise<calendar_v3.Calendar | null> {
  const creds = await getCredentialsForOrg(orgId);
  if (!creds) return null;

  const fresh = await refreshCredentialsIfNeeded(orgId, creds);
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: fresh.access_token,
    refresh_token: fresh.refresh_token,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}
