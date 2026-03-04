/**
 * Service Meta / Instagram - Récupération des credentials et appels API
 * Page access token ne nécessite pas de refresh.
 */

import type { MetaCredentials } from '@/lib/supabase/integrations';
import { decrypt } from '@/lib/integrations/encryption';
import { createAdminClient } from '@/lib/supabase/admin';

const GRAPH_API = 'https://graph.facebook.com/v21.0';
const GRAPH_IG_API = 'https://graph.instagram.com/v21.0';

const TRANSIENT_RETRY_ATTEMPTS = 2;
const TRANSIENT_RETRY_DELAY_MS = 1500;
const CONTAINER_POLL_INTERVAL_MS = 2000;
const CONTAINER_POLL_MAX_ATTEMPTS = 60; // 2 min max

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Publie un container créé (feed, story, reel, carousel). */
async function publishContainer(
  userPath: string,
  containerId: string,
  token: string
): Promise<{ id: string } | { error: string }> {
  const params = new URLSearchParams({
    access_token: token,
    creation_id: containerId,
  });
  const res = await fetch(
    `${GRAPH_IG_API}/${userPath}/media_publish?${params.toString()}`,
    { method: 'POST' }
  );
  const data = (await res.json()) as { id?: string; error?: { message: string } };
  if (data.error || !data.id) {
    return { error: data.error?.message ?? 'Échec de la publication' };
  }
  return { id: data.id };
}

/** Attend que le container vidéo soit prêt (status_code FINISHED). */
async function waitForContainerReady(
  containerId: string,
  token: string
): Promise<'FINISHED' | 'ERROR'> {
  for (let i = 0; i < CONTAINER_POLL_MAX_ATTEMPTS; i++) {
    await sleep(CONTAINER_POLL_INTERVAL_MS);
    const res = await fetch(
      `${GRAPH_IG_API}/${containerId}?fields=status_code&access_token=${encodeURIComponent(token)}`
    );
    const data = (await res.json()) as { status_code?: string; error?: { message: string } };
    if (data.error) return 'ERROR';
    const status = data.status_code;
    if (status === 'FINISHED') return 'FINISHED';
    if (status === 'ERROR' || status === 'EXPIRED') return 'ERROR';
  }
  return 'ERROR';
}

export type MetaErrorReason = 'no_credentials' | 'api_error';

export interface MetaErrorResult {
  success: false;
  reason: MetaErrorReason;
  details?: string;
  /** Erreur temporaire côté Meta (code 2, is_transient) - réessayer plus tard */
  isTransient?: boolean;
}

async function getCredentialsForOrg(orgId: string): Promise<MetaCredentials | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('organisation_integrations')
    .select('encrypted_credentials')
    .eq('org_id', orgId)
    .eq('provider', 'meta')
    .maybeSingle();

  if (error || !data?.encrypted_credentials) {
    if (error) console.error('[Meta] getCredentialsForOrg DB error:', error.message);
    return null;
  }

  try {
    const plain = await decrypt(data.encrypted_credentials);
    return JSON.parse(plain) as MetaCredentials;
  } catch (e) {
    console.error('[Meta] getCredentialsForOrg decrypt/parse error:', e instanceof Error ? e.message : e);
    return null;
  }
}

/** Token à utiliser pour les appels API (Instagram Login ou Facebook Login) */
function getAccessToken(creds: MetaCredentials): string | null {
  return creds.access_token ?? creds.page_access_token ?? null;
}

/**
 * Chemin utilisateur pour les appels API.
 * Instagram Login (access_token) : utiliser /me (évite l'erreur "Object does not exist" subcode 33).
 * Facebook Login (page_access_token) : utiliser /{ig_user_id}.
 */
function getUserPath(creds: MetaCredentials): string | null {
  if (creds.access_token) return 'me';
  if (creds.page_access_token && creds.ig_user_id) return creds.ig_user_id;
  return null;
}

/** Parse une erreur Meta depuis le corps de la réponse (JSON ou texte brut) */
function parseMetaErrorResponse(
  responseText: string
): { details: string; isTransient: boolean } {
  try {
    const json = JSON.parse(responseText) as { error?: { message?: string; code?: number; is_transient?: boolean } };
    const err = json?.error;
    if (err) {
      const isTransient = err.code === 2 || err.is_transient === true;
      const msg = err.message ?? responseText;
      return {
        details: isTransient
          ? 'Erreur temporaire côté Instagram. Réessayez dans quelques minutes.'
          : msg.toLowerCase().includes('token') || msg.toLowerCase().includes('expired') || err.code === 190
            ? 'Token expiré. Reconnectez Meta.'
            : msg,
        isTransient,
      };
    }
  } catch {
    // ignore
  }
  return { details: responseText, isTransient: false };
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  permalink?: string;
  caption?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

export interface InstagramMediaWithInsights extends InstagramMedia {
  insights?: { reach?: number; impressions?: number; engagement?: number };
}

export interface InstagramAccountInfo {
  username?: string;
  followers_count?: number;
  media_count?: number;
}

export type GetInstagramAccountInfoResult = InstagramAccountInfo | MetaErrorResult;

/**
 * Récupère les infos du compte Instagram (followers, nb de posts).
 */
export async function getInstagramAccountInfo(
  orgId: string
): Promise<InstagramAccountInfo | MetaErrorResult> {
  const creds = await getCredentialsForOrg(orgId);
  const token = creds ? getAccessToken(creds) : null;
  const userPath = creds ? getUserPath(creds) : null;
  if (!creds || !token || !userPath) {
    return { success: false, reason: 'no_credentials' };
  }

  const params = new URLSearchParams({
    access_token: token,
    fields: 'username,followers_count,media_count',
  });

  for (let attempt = 1; attempt <= TRANSIENT_RETRY_ATTEMPTS; attempt++) {
    const res = await fetch(`${GRAPH_IG_API}/${userPath}?${params.toString()}`);
    const responseText = await res.text();
    const json = JSON.parse(responseText) as {
      username?: string;
      followers_count?: number;
      media_count?: number;
      error?: { message: string; code?: number; is_transient?: boolean };
    };

    if (!res.ok) {
      const parsed = parseMetaErrorResponse(responseText);
      if (parsed.isTransient && attempt < TRANSIENT_RETRY_ATTEMPTS) {
        console.warn(`[Meta] Instagram account info transient error, retry ${attempt}/${TRANSIENT_RETRY_ATTEMPTS} in ${TRANSIENT_RETRY_DELAY_MS}ms`);
        await sleep(TRANSIENT_RETRY_DELAY_MS);
        continue;
      }
      console.error('[Meta] Instagram account info error:', res.status, responseText);
      return { success: false, reason: 'api_error', details: parsed.details, isTransient: parsed.isTransient };
    }

    if (json.error) {
      const msg = json.error?.message ?? JSON.stringify(json.error);
      const isTransient = json.error?.code === 2 || json.error?.is_transient === true;
      if (isTransient && attempt < TRANSIENT_RETRY_ATTEMPTS) {
        console.warn(`[Meta] Instagram account info transient error (body), retry ${attempt}/${TRANSIENT_RETRY_ATTEMPTS} in ${TRANSIENT_RETRY_DELAY_MS}ms`);
        await sleep(TRANSIENT_RETRY_DELAY_MS);
        continue;
      }
      if (isTransient) {
        return {
          success: false,
          reason: 'api_error',
          details: 'Erreur temporaire côté Instagram. Réessayez dans quelques minutes.',
          isTransient,
        };
      }
      console.error('[Meta] Instagram account info error:', json.error?.message, 'code:', json.error?.code);
      const isTokenExpired =
        msg.toLowerCase().includes('token') ||
        msg.toLowerCase().includes('expired') ||
        json.error?.code === 190;
      return {
        success: false,
        reason: 'api_error',
        details: isTokenExpired ? 'Token expiré. Reconnectez Meta.' : msg,
        isTransient: false,
      };
    }

    return {
      username: json.username,
      followers_count: json.followers_count,
      media_count: json.media_count,
    };
  }

  return {
    success: false,
    reason: 'api_error',
    details: 'Erreur temporaire côté Instagram. Réessayez dans quelques minutes.',
    isTransient: true,
  };
}

export interface InstagramAccountInsights {
  reach?: number;
  accounts_engaged?: number;
  impressions?: number;
}

export type GetAccountInsightsResult = InstagramAccountInsights | MetaErrorResult;

/**
 * Récupère les insights du compte (reach, portée, interactions) sur une période.
 */
export async function getAccountInsights(
  orgId: string,
  periodDays: number = 7
): Promise<InstagramAccountInsights | MetaErrorResult> {
  const creds = await getCredentialsForOrg(orgId);
  const token = creds ? getAccessToken(creds) : null;
  const userPath = creds ? getUserPath(creds) : null;
  if (!creds || !token || !userPath) {
    return { success: false, reason: 'no_credentials' };
  }

  const now = Math.floor(Date.now() / 1000);
  const since = now - periodDays * 24 * 60 * 60;

  const params = new URLSearchParams({
    access_token: token,
    metric: 'reach,accounts_engaged,impressions',
    period: 'day',
    metric_type: 'time_series',
    since: String(since),
    until: String(now),
  });

  for (let attempt = 1; attempt <= TRANSIENT_RETRY_ATTEMPTS; attempt++) {
    const res = await fetch(
      `${GRAPH_IG_API}/${userPath}/insights?${params.toString()}`
    );
    const responseText = await res.text();
    const json = JSON.parse(responseText) as {
      data?: Array<{
        name: string;
        values?: Array<{ value: string }>;
        total_value?: { value: number };
      }>;
      error?: { message: string; code?: number; is_transient?: boolean };
    };

    if (!res.ok) {
      const parsed = parseMetaErrorResponse(responseText);
      if (parsed.isTransient && attempt < TRANSIENT_RETRY_ATTEMPTS) {
        console.warn(`[Meta] Instagram account insights transient error, retry ${attempt}/${TRANSIENT_RETRY_ATTEMPTS} in ${TRANSIENT_RETRY_DELAY_MS}ms`);
        await sleep(TRANSIENT_RETRY_DELAY_MS);
        continue;
      }
      console.error('[Meta] Instagram account insights error:', res.status, responseText);
      return { success: false, reason: 'api_error', details: parsed.details, isTransient: parsed.isTransient };
    }

    if (json.error) {
      const msg = json.error?.message ?? JSON.stringify(json.error);
      const isTransient = json.error?.code === 2 || json.error?.is_transient === true;
      if (isTransient && attempt < TRANSIENT_RETRY_ATTEMPTS) {
        console.warn(`[Meta] Instagram account insights transient error (body), retry ${attempt}/${TRANSIENT_RETRY_ATTEMPTS} in ${TRANSIENT_RETRY_DELAY_MS}ms`);
        await sleep(TRANSIENT_RETRY_DELAY_MS);
        continue;
      }
      if (isTransient) {
        return {
          success: false,
          reason: 'api_error',
          details: 'Erreur temporaire côté Instagram. Réessayez dans quelques minutes.',
          isTransient,
        };
      }
      console.error('[Meta] Instagram account insights error:', json.error?.message, 'code:', json.error?.code);
      const isTokenExpired =
        msg.toLowerCase().includes('token') ||
        msg.toLowerCase().includes('expired') ||
        json.error?.code === 190;
      return {
        success: false,
        reason: 'api_error',
        details: isTokenExpired ? 'Token expiré. Reconnectez Meta.' : msg,
        isTransient: false,
      };
    }
    if (!json.data) return { success: false, reason: 'api_error', details: 'Pas de données' };

    const result: InstagramAccountInsights = {};
  for (const m of json.data) {
    let sum = 0;
    if (m.total_value?.value != null) {
      sum = m.total_value.value;
    } else {
      const values = m.values ?? [];
      sum = values.reduce((acc, v) => acc + parseInt(v.value || '0', 10), 0);
    }
    if (m.name === 'reach') result.reach = sum;
    else if (m.name === 'accounts_engaged') result.accounts_engaged = sum;
    else if (m.name === 'impressions') result.impressions = sum;
  }
  return result;
  }

  return {
    success: false,
    reason: 'api_error',
    details: 'Erreur temporaire côté Instagram. Réessayez dans quelques minutes.',
    isTransient: true,
  };
}

export interface AccountInsightsDailyPoint {
  date: string;
  label: string;
  reach: number;
  impressions: number;
}

export type GetAccountInsightsDailyResult =
  | { success: true; data: AccountInsightsDailyPoint[] }
  | MetaErrorResult;

/**
 * Récupère les insights du compte par jour (reach, impressions) pour les graphiques.
 */
export async function getAccountInsightsDaily(
  orgId: string,
  periodDays: number = 28
): Promise<GetAccountInsightsDailyResult> {
  const creds = await getCredentialsForOrg(orgId);
  const token = creds ? getAccessToken(creds) : null;
  const userPath = creds ? getUserPath(creds) : null;
  if (!creds || !token || !userPath) {
    return { success: false, reason: 'no_credentials' };
  }

  const now = Math.floor(Date.now() / 1000);
  const since = now - periodDays * 24 * 60 * 60;

  const params = new URLSearchParams({
    access_token: token,
    metric: 'reach,impressions',
    period: 'day',
    metric_type: 'time_series',
    since: String(since),
    until: String(now),
  });

  for (let attempt = 1; attempt <= TRANSIENT_RETRY_ATTEMPTS; attempt++) {
    const res = await fetch(
      `${GRAPH_IG_API}/${userPath}/insights?${params.toString()}`
    );
    const responseText = await res.text();
    const json = JSON.parse(responseText) as {
      data?: Array<{
        name: string;
        values?: Array<{ value: string; end_time?: string }>;
      }>;
      error?: { message: string; code?: number; is_transient?: boolean };
    };

    if (!res.ok) {
      const parsed = parseMetaErrorResponse(responseText);
      if (parsed.isTransient && attempt < TRANSIENT_RETRY_ATTEMPTS) {
        console.warn(`[Meta] Instagram account insights daily transient error, retry ${attempt}/${TRANSIENT_RETRY_ATTEMPTS}`);
        await sleep(TRANSIENT_RETRY_DELAY_MS);
        continue;
      }
      return { success: false, reason: 'api_error', details: parsed.details, isTransient: parsed.isTransient };
    }

    if (json.error) {
      const msg = json.error?.message ?? JSON.stringify(json.error);
      const isTransient = json.error?.code === 2 || json.error?.is_transient === true;
      if (isTransient && attempt < TRANSIENT_RETRY_ATTEMPTS) {
        await sleep(TRANSIENT_RETRY_DELAY_MS);
        continue;
      }
      const isTokenExpired = msg.toLowerCase().includes('token') || msg.toLowerCase().includes('expired') || json.error?.code === 190;
      return {
        success: false,
        reason: 'api_error',
        details: isTokenExpired ? 'Token expiré. Reconnectez Meta.' : msg,
        isTransient: false,
      };
    }

    if (!json.data) return { success: false, reason: 'api_error', details: 'Pas de données' };

    const byDate = new Map<string, { reach: number; impressions: number }>();

    for (const m of json.data) {
      const values = m.values ?? [];
      for (const v of values) {
        const endTime = v.end_time ?? '';
        const dateStr = endTime.split('T')[0] ?? '';
        if (!dateStr) continue;

        const val = parseInt(v.value || '0', 10);
        const entry = byDate.get(dateStr) ?? { reach: 0, impressions: 0 };
        if (m.name === 'reach') entry.reach = val;
        else if (m.name === 'impressions') entry.impressions = val;
        byDate.set(dateStr, entry);
      }
    }

    const sortedDates = Array.from(byDate.keys()).sort();
    const data: AccountInsightsDailyPoint[] = sortedDates.map((date) => {
      const entry = byDate.get(date)!;
      const d = new Date(date + 'T12:00:00Z');
      const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      return { date, label, reach: entry.reach, impressions: entry.impressions };
    });

    return { success: true, data };
  }

  return {
    success: false,
    reason: 'api_error',
    details: 'Erreur temporaire côté Instagram. Réessayez dans quelques minutes.',
    isTransient: true,
  };
}

export type GetInstagramMediaResult =
  | { success: true; data: InstagramMedia[]; paging?: { cursors?: { after?: string }; next?: string } }
  | MetaErrorResult;

/**
 * Récupère un média Instagram par ID (pour les posts campagne avec ig_media_id).
 */
export async function getInstagramMediaById(
  orgId: string,
  mediaId: string
): Promise<InstagramMedia | null> {
  const creds = await getCredentialsForOrg(orgId);
  const token = creds ? getAccessToken(creds) : null;
  if (!creds || !token) return null;

  const params = new URLSearchParams({
    access_token: token,
    fields: 'id,media_type,media_url,permalink,caption,timestamp,like_count,comments_count',
  });

  const res = await fetch(`${GRAPH_IG_API}/${mediaId}?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    console.error('[Meta] Instagram media by id error:', res.status, text);
    return null;
  }

  const json = (await res.json()) as InstagramMedia & { error?: { message: string } };
  if (json.error) return null;
  return json;
}

/**
 * Liste les médias (posts) du compte Instagram.
 */
export async function getInstagramMedia(
  orgId: string,
  options?: { limit?: number; after?: string }
): Promise<GetInstagramMediaResult> {
  const creds = await getCredentialsForOrg(orgId);
  const token = creds ? getAccessToken(creds) : null;
  const userPath = creds ? getUserPath(creds) : null;
  if (!creds || !token || !userPath) {
    return { success: false, reason: 'no_credentials' };
  }

  const params = new URLSearchParams({
    access_token: token,
    fields: 'id,media_type,media_url,permalink,caption,timestamp,like_count,comments_count',
    limit: String(options?.limit ?? 25),
  });
  if (options?.after) params.set('after', options.after);

  for (let attempt = 1; attempt <= TRANSIENT_RETRY_ATTEMPTS; attempt++) {
    const res = await fetch(
      `${GRAPH_IG_API}/${userPath}/media?${params.toString()}`
    );
    const responseText = await res.text();
    const json = JSON.parse(responseText) as {
      data?: InstagramMedia[];
      paging?: { cursors?: { after?: string }; next?: string };
      error?: { message: string; code?: number; is_transient?: boolean };
    };

    if (!res.ok) {
      const parsed = parseMetaErrorResponse(responseText);
      if (parsed.isTransient && attempt < TRANSIENT_RETRY_ATTEMPTS) {
        console.warn(`[Meta] Instagram media transient error, retry ${attempt}/${TRANSIENT_RETRY_ATTEMPTS} in ${TRANSIENT_RETRY_DELAY_MS}ms`);
        await sleep(TRANSIENT_RETRY_DELAY_MS);
        continue;
      }
      console.error('[Meta] Instagram media API error:', res.status, responseText);
      return { success: false, reason: 'api_error', details: parsed.details, isTransient: parsed.isTransient };
    }

    if (json.error) {
      const msg = json.error?.message ?? JSON.stringify(json.error);
      const isTransient = json.error?.code === 2 || json.error?.is_transient === true;
      if (isTransient && attempt < TRANSIENT_RETRY_ATTEMPTS) {
        console.warn(`[Meta] Instagram media transient error (body), retry ${attempt}/${TRANSIENT_RETRY_ATTEMPTS} in ${TRANSIENT_RETRY_DELAY_MS}ms`);
        await sleep(TRANSIENT_RETRY_DELAY_MS);
        continue;
      }
      if (isTransient) {
        return {
          success: false,
          reason: 'api_error',
          details: 'Erreur temporaire côté Instagram. Réessayez dans quelques minutes.',
          isTransient,
        };
      }
      console.error('[Meta] Instagram media error:', json.error?.message, 'code:', json.error?.code);
      const isTokenExpired =
        msg.toLowerCase().includes('token') ||
        msg.toLowerCase().includes('expired') ||
        json.error?.code === 190;
      return {
        success: false,
        reason: 'api_error',
        details: isTokenExpired ? 'Token expiré. Reconnectez Meta.' : msg,
        isTransient: false,
      };
    }

    return {
      success: true,
      data: json.data ?? [],
      paging: json.paging,
    };
  }

  return {
    success: false,
    reason: 'api_error',
    details: 'Erreur temporaire côté Instagram. Réessayez dans quelques minutes.',
    isTransient: true,
  };
}

/**
 * Récupère les insights d'un média (reach, impressions, engagement).
 */
export async function getMediaInsights(
  orgId: string,
  mediaId: string,
  metrics: string[] = ['reach', 'impressions', 'engagement']
): Promise<{ reach?: number; impressions?: number; engagement?: number } | null> {
  const creds = await getCredentialsForOrg(orgId);
  const token = creds ? getAccessToken(creds) : null;
  if (!creds || !token) return null;

  const params = new URLSearchParams({
    access_token: token,
    metric: metrics.join(','),
  });

  const res = await fetch(
    `${GRAPH_IG_API}/${mediaId}/insights?${params.toString()}`
  );
  if (!res.ok) {
    const text = await res.text();
    console.error('[Meta] Instagram media insights API error:', res.status, text);
    return null;
  }

  const json = (await res.json()) as {
    data?: Array<{ name: string; values: Array<{ value: string }> }>;
    error?: { message: string };
  };

  if (json.error || !json.data) return null;

  const result: { reach?: number; impressions?: number; engagement?: number } = {};
  for (const m of json.data) {
    const val = m.values?.[0]?.value;
    if (val) {
      const num = parseInt(val, 10);
      if (m.name === 'reach') result.reach = num;
      else if (m.name === 'impressions') result.impressions = num;
      else if (m.name === 'engagement') result.engagement = num;
    }
  }
  return result;
}

/**
 * Publie une image sur Instagram (Feed).
 * imageUrl doit être une URL publique accessible.
 */
export async function publishInstagramImage(
  orgId: string,
  imageUrl: string,
  caption?: string
): Promise<{ id: string } | { error: string }> {
  const creds = await getCredentialsForOrg(orgId);
  const token = creds ? getAccessToken(creds) : null;
  const userPath = creds ? getUserPath(creds) : null;
  if (!creds || !token || !userPath) return { error: 'Meta non connecté' };

  const createParams = new URLSearchParams({
    access_token: token,
    image_url: imageUrl,
  });
  if (caption) createParams.set('caption', caption);

  const createRes = await fetch(
    `${GRAPH_IG_API}/${userPath}/media?${createParams.toString()}`,
    { method: 'POST' }
  );
  const createData = (await createRes.json()) as { id?: string; error?: { message: string } };

  if (createData.error || !createData.id) {
    return { error: createData.error?.message ?? 'Échec de la création du média' };
  }

  const status = await waitForContainerReady(createData.id, token);
  if (status !== 'FINISHED') {
    return { error: 'L\'image n\'a pas pu être traitée par Instagram. Réessayez ou utilisez une URL publique.' };
  }

  return publishContainer(userPath, createData.id, token);
}

/**
 * Publie une Story Instagram (image ou vidéo).
 * Stories : pas de caption (ignoré par l'API).
 */
export async function publishInstagramStory(
  orgId: string,
  mediaUrl: string,
  isVideo: boolean
): Promise<{ id: string } | { error: string }> {
  const creds = await getCredentialsForOrg(orgId);
  const token = creds ? getAccessToken(creds) : null;
  const userPath = creds ? getUserPath(creds) : null;
  if (!creds || !token || !userPath) return { error: 'Meta non connecté' };

  const createParams = new URLSearchParams({
    access_token: token,
    media_type: 'STORIES',
  });
  if (isVideo) {
    createParams.set('video_url', mediaUrl);
  } else {
    createParams.set('image_url', mediaUrl);
  }

  const createRes = await fetch(
    `${GRAPH_IG_API}/${userPath}/media?${createParams.toString()}`,
    { method: 'POST' }
  );
  const createData = (await createRes.json()) as { id?: string; error?: { message: string } };

  if (createData.error || !createData.id) {
    return { error: createData.error?.message ?? 'Échec de la création de la Story' };
  }

  // Attendre que le container soit prêt (images et vidéos) avant de publier
  const status = await waitForContainerReady(createData.id, token);
  if (status !== 'FINISHED') {
    return {
      error: isVideo
        ? 'La vidéo n\'a pas pu être traitée par Instagram. Réessayez ou utilisez une URL publique.'
        : 'L\'image n\'a pas pu être traitée par Instagram. Réessayez ou utilisez une URL publique.',
    };
  }

  return publishContainer(userPath, createData.id, token);
}

/**
 * Publie un Reel Instagram (vidéo).
 */
export async function publishInstagramReel(
  orgId: string,
  videoUrl: string,
  caption?: string,
  coverUrl?: string
): Promise<{ id: string } | { error: string }> {
  const creds = await getCredentialsForOrg(orgId);
  const token = creds ? getAccessToken(creds) : null;
  const userPath = creds ? getUserPath(creds) : null;
  if (!creds || !token || !userPath) return { error: 'Meta non connecté' };

  const createParams = new URLSearchParams({
    access_token: token,
    media_type: 'REELS',
    video_url: videoUrl,
  });
  if (caption) createParams.set('caption', caption);
  if (coverUrl) createParams.set('cover_url', coverUrl);

  const createRes = await fetch(
    `${GRAPH_IG_API}/${userPath}/media?${createParams.toString()}`,
    { method: 'POST' }
  );
  const createData = (await createRes.json()) as { id?: string; error?: { message: string } };

  if (createData.error || !createData.id) {
    return { error: createData.error?.message ?? 'Échec de la création du Réel' };
  }

  const status = await waitForContainerReady(createData.id, token);
  if (status !== 'FINISHED') {
    return { error: 'La vidéo n\'a pas pu être traitée par Instagram. Réessayez ou utilisez une URL publique.' };
  }

  return publishContainer(userPath, createData.id, token);
}

/**
 * Publie un carrousel Instagram (2 à 10 images).
 */
export async function publishInstagramCarousel(
  orgId: string,
  imageUrls: string[],
  caption?: string
): Promise<{ id: string } | { error: string }> {
  const creds = await getCredentialsForOrg(orgId);
  const token = creds ? getAccessToken(creds) : null;
  const userPath = creds ? getUserPath(creds) : null;
  if (!creds || !token || !userPath) return { error: 'Meta non connecté' };

  if (imageUrls.length < 2 || imageUrls.length > 10) {
    return { error: 'Le carrousel doit contenir entre 2 et 10 images' };
  }

  const itemIds: string[] = [];
  for (const imageUrl of imageUrls) {
    const createParams = new URLSearchParams({
      access_token: token,
      image_url: imageUrl,
      is_carousel_item: 'true',
    });
    const createRes = await fetch(
      `${GRAPH_IG_API}/${userPath}/media?${createParams.toString()}`,
      { method: 'POST' }
    );
    const createData = (await createRes.json()) as { id?: string; error?: { message: string } };

    if (createData.error || !createData.id) {
      return { error: createData.error?.message ?? `Échec de la création de l'image ${itemIds.length + 1}` };
    }
    itemIds.push(createData.id);
  }

  const carouselParams = new URLSearchParams({
    access_token: token,
    media_type: 'CAROUSEL',
    children: itemIds.join(','),
  });
  if (caption) carouselParams.set('caption', caption);

  const carouselRes = await fetch(
    `${GRAPH_IG_API}/${userPath}/media?${carouselParams.toString()}`,
    { method: 'POST' }
  );
  const carouselData = (await carouselRes.json()) as { id?: string; error?: { message: string } };

  if (carouselData.error || !carouselData.id) {
    return { error: carouselData.error?.message ?? 'Échec de la création du carrousel' };
  }

  const status = await waitForContainerReady(carouselData.id, token);
  if (status !== 'FINISHED') {
    return { error: 'Le carrousel n\'a pas pu être traité par Instagram. Réessayez.' };
  }

  return publishContainer(userPath, carouselData.id, token);
}
