/**
 * Service d'activités - agrège les créations d'événements, réunions et produits
 * pour afficher un flux d'activités récentes.
 */

import { supabase } from './supabase/client';
import { getActiveOrgId } from './supabase/activeOrg';

export type ActivityType = 'event' | 'meeting' | 'product';

export type ActivityAction = 'created' | 'deleted';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  createdAt: Date;
  url: string;
  createdBy?: string;
  /** Action effectuée : création ou suppression */
  action?: ActivityAction;
}

const FETCH_LIMIT_PER_TABLE = 500;

export interface GetActivitiesOptions {
  limit?: number;
  offset?: number;
}

export interface GetActivitiesResult {
  items: Activity[];
  total: number;
  hasMore: boolean;
}

type EventRow = { id: string; name: string; created_at: string; created_by: string | null };
type MeetingRow = { id: string; title: string; created_at: string; created_by: string | null };
type ProductRow = { id: string; name: string; created_at: string; created_by: string | null };

function buildEventActivity(row: EventRow, creatorNames: Map<string, string>): Activity {
  return {
    id: row.id,
    type: 'event',
    action: 'created',
    title: row.name,
    createdAt: new Date(row.created_at),
    url: `/dashboard/events/${row.id}`,
    createdBy: row.created_by ? creatorNames.get(row.created_by) : undefined,
  };
}

function buildMeetingActivity(row: MeetingRow, creatorNames: Map<string, string>): Activity {
  return {
    id: row.id,
    type: 'meeting',
    action: 'created',
    title: row.title,
    createdAt: new Date(row.created_at),
    url: `/dashboard/meetings/${row.id}`,
    createdBy: row.created_by ? creatorNames.get(row.created_by) : undefined,
  };
}

function buildProductActivity(row: ProductRow, creatorNames: Map<string, string>): Activity {
  return {
    id: row.id,
    type: 'product',
    action: 'created',
    title: row.name,
    createdAt: new Date(row.created_at),
    url: `/dashboard/products/${row.id}`,
    createdBy: row.created_by ? creatorNames.get(row.created_by) : undefined,
  };
}

export async function getActivities(
  options: GetActivitiesOptions = {}
): Promise<GetActivitiesResult> {
  const { limit = 20, offset = 0 } = options;
  const orgId = getActiveOrgId();

  const baseSelect = (table: string, select: string) => {
    let q = supabase.from(table).select(select);
    if (orgId) q = q.eq('org_id', orgId);
    return q.order('created_at', { ascending: false }).limit(FETCH_LIMIT_PER_TABLE);
  };

  const baseCount = (table: string) => {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (orgId) q = q.eq('org_id', orgId);
    return q;
  };

  const [eventsRes, meetingsRes, productsRes, eventsCount, meetingsCount, productsCount] =
    await Promise.all([
      baseSelect('events', 'id, name, created_at, created_by'),
      baseSelect('meetings', 'id, title, created_at, created_by'),
      baseSelect('products', 'id, name, created_at, created_by'),
      baseCount('events'),
      baseCount('meetings'),
      baseCount('products'),
    ]);

  const creatorIds = new Set<string>();
  const eventsData = (eventsRes.data ?? []) as unknown as EventRow[];
  const meetingsData = (meetingsRes.data ?? []) as unknown as MeetingRow[];
  const productsData = (productsRes.data ?? []) as unknown as ProductRow[];

  for (const r of eventsData) {
    if (r.created_by) creatorIds.add(r.created_by);
  }
  for (const r of meetingsData) {
    if (r.created_by) creatorIds.add(r.created_by);
  }
  for (const r of productsData) {
    if (r.created_by) creatorIds.add(r.created_by);
  }

  let creatorNames = new Map<string, string>();
  if (creatorIds.size > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', Array.from(creatorIds));
    creatorNames = new Map(
      (profiles ?? []).map((p: { id: string; first_name: string; last_name: string }) => [
        p.id,
        [p.first_name, p.last_name].filter(Boolean).join(' ').trim() || 'Utilisateur',
      ])
    );
  }

  const events = eventsData.map((r) => buildEventActivity(r, creatorNames));
  const meetings = meetingsData.map((r) => buildMeetingActivity(r, creatorNames));
  const products = productsData.map((r) => buildProductActivity(r, creatorNames));

  const all = [...events, ...meetings, ...products].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const total =
    (eventsCount.count ?? 0) + (meetingsCount.count ?? 0) + (productsCount.count ?? 0);
  const items = all.slice(offset, offset + limit);
  const hasMore = offset + items.length < total;

  return { items, total, hasMore };
}
