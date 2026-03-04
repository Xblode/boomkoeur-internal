import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDriveClient } from '@/lib/integrations/google';
import {
  createOrGetFolder,
  uploadFileToDrive,
  BILAN_FOLDER_NAME,
} from '@/lib/integrations/google-drive-upload';
import {
  getInstagramAccountInfo,
  getAccountInsights,
  getInstagramMediaById,
  getMediaInsights,
} from '@/lib/integrations/meta';
import { getOrgIntegrationWithAdmin, type ShotgunCredentials } from '@/lib/supabase/integrations';
import { generateBilanPdf } from '@/lib/utils/campaign/bilan-pdf';
import type { Event, ComWorkflow } from '@/types/event';
import type { ShotgunTicket } from '@/types/shotgun';
import { format } from 'date-fns';

const SHOTGUN_TICKETS_URL = 'https://api.shotgun.live/tickets';

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

async function fetchEvent(admin: ReturnType<typeof createAdminClient>, id: string): Promise<Event | null> {
  const { data: row, error } = await admin
    .from('events')
    .select('id, org_id, name, date, location, com_workflow, shotgun_event_id, shotgun_event_url')
    .eq('id', id)
    .single();
  if (error || !row) return null;
  const r = row as {
    id: string;
    org_id?: string;
    name: string;
    date: string;
    location: string;
    com_workflow: unknown;
    shotgun_event_id: number | null;
    shotgun_event_url: string | null;
  };
  return {
    id: r.id,
    orgId: r.org_id ?? undefined,
    name: r.name,
    date: new Date(r.date),
    location: r.location ?? '',
    description: '',
    status: 'confirmed',
    artists: [],
    linkedElements: [],
    tags: [],
    comments: [],
    comWorkflow: (r.com_workflow as ComWorkflow) ?? undefined,
    shotgunEventId: r.shotgun_event_id ?? undefined,
    shotgunEventUrl: r.shotgun_event_url ?? undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function fetchShotgunTickets(orgId: string, eventId: number): Promise<ShotgunTicket[]> {
  const creds = await getOrgIntegrationWithAdmin<ShotgunCredentials>(orgId, 'shotgun');
  if (!creds) return [];
  const { organizerId, apiToken } = creds;
  const url = new URL(SHOTGUN_TICKETS_URL);
  url.searchParams.set('organizer_id', organizerId);
  url.searchParams.set('event_id', String(eventId));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiToken}` },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data ?? []) as ShotgunTicket[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  let body: { org_id?: string; bilan_notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }
  const orgId = body.org_id ?? request.nextUrl.searchParams.get('org_id');
  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const admin = createAdminClient();
  const event = await fetchEvent(admin, eventId);
  if (!event) {
    return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 });
  }
  if (event.orgId && event.orgId !== orgId) {
    return NextResponse.json({ error: 'Accès refusé à cet événement' }, { status: 403 });
  }

  const bilanNotes = body.bilan_notes?.trim() ?? event.comWorkflow?.bilanNotes?.trim();
  const wf = event.comWorkflow;
  const posts = wf?.posts ?? [];
  const campaignPostsWithIg = posts.filter(
    (p): p is typeof p & { ig_media_id: string } => !!p.ig_media_id
  );

  let instagramAccount: { username?: string; followers_count?: number } | undefined;
  let instagramReach: number | undefined;
  let followersAtStart: number | undefined;
  const postsWithStats: Array<{
    postName: string;
    type?: string;
    reach?: number;
    impressions?: number;
    likes?: number;
    comments?: number;
    engagement?: number;
    saved?: number;
    shares?: number;
    views?: number;
  }> = [];

  const accountResult = await getInstagramAccountInfo(orgId);
  const isMetaError = (r: unknown): r is { success: false } =>
    typeof r === 'object' && r !== null && 'success' in r && (r as { success: boolean }).success === false;
  if (!isMetaError(accountResult)) {
    instagramAccount = accountResult;
  }
  const insightsResult = await getAccountInsights(orgId, 7);
  if (!isMetaError(insightsResult)) {
    instagramReach = insightsResult.reach ?? insightsResult.impressions;
  }
  followersAtStart = wf?.followers_count_at_campaign_start;

  for (const post of campaignPostsWithIg) {
    const media = await getInstagramMediaById(orgId, post.ig_media_id);
    const mediaExt = media as { media_product_type?: string; media_type?: string; like_count?: number; comments_count?: number } | null;
    const mediaType = mediaExt?.media_product_type ?? mediaExt?.media_type ?? undefined;
    const insights = await getMediaInsights(orgId, post.ig_media_id, {
      mediaType: mediaType ?? undefined,
    });
    const isInsightsError = (r: unknown): r is { success: false } =>
      typeof r === 'object' && r !== null && 'success' in r && (r as { success: boolean }).success === false;
    const ins = !isInsightsError(insights) ? insights : undefined;
    postsWithStats.push({
      postName: post.name ?? '-',
      type: post.type,
      reach: ins?.reach ?? ins?.impressions,
      impressions: ins?.impressions,
      likes: ins?.likes ?? mediaExt?.like_count,
      comments: ins?.comments ?? mediaExt?.comments_count,
      engagement: ins?.engagement,
      saved: ins?.saved,
      shares: ins?.shares,
      views: ins?.views,
    });
  }

  let shotgunTickets: ShotgunTicket[] = [];
  if (event.shotgunEventId) {
    shotgunTickets = await fetchShotgunTickets(orgId, event.shotgunEventId);
  }

  const pdfBuffer = generateBilanPdf({
    event,
    bilanNotes,
    instagramAccount,
    instagramReach,
    followersAtStart,
    postsWithStats: postsWithStats.length > 0 ? postsWithStats : undefined,
    shotgunTickets: shotgunTickets.length > 0 ? shotgunTickets : undefined,
  });

  const drive = await getDriveClient(orgId);
  if (!drive) {
    return NextResponse.json(
      { error: 'Google Drive non connecté. Configurez l\'intégration dans Administration > Intégrations.' },
      { status: 400 }
    );
  }

  try {
    const folderId = await createOrGetFolder(drive, BILAN_FOLDER_NAME);
    const safeName = event.name.replace(/[<>:"/\\|?*]/g, '_').slice(0, 80);
    const filename = `Bilan_${safeName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    const { webViewLink } = await uploadFileToDrive(
      drive,
      pdfBuffer,
      filename,
      'application/pdf',
      folderId
    );
    return NextResponse.json({ success: true, webViewLink });
  } catch (err) {
    console.error('Bilan export Drive error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement sur Drive' },
      { status: 500 }
    );
  }
}
