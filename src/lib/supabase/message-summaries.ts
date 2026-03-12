/**
 * Journal - résumés quotidiens des messages (synthèse IA)
 */

import { supabase } from './client';

export type DaySummary = {
  id: string;
  orgId: string;
  date: string;
  summary: string;
  messageCount: number;
  createdAt: Date;
};

export async function saveDaySummary(
  orgId: string,
  date: string,
  summary: string,
  messageCount: number
): Promise<void> {
  const { error } = await supabase
    .from('message_day_summaries')
    .upsert(
      { org_id: orgId, date, summary, message_count: messageCount },
      { onConflict: 'org_id,date' }
    );

  if (error) throw error;
}

export async function getDaySummary(orgId: string, date: string): Promise<DaySummary | null> {
  const { data, error } = await supabase
    .from('message_day_summaries')
    .select('id, org_id, date, summary, message_count, created_at')
    .eq('org_id', orgId)
    .eq('date', date)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    orgId: data.org_id,
    date: data.date,
    summary: data.summary,
    messageCount: data.message_count ?? 0,
    createdAt: new Date(data.created_at),
  };
}

export async function getDaySummaries(orgId: string): Promise<DaySummary[]> {
  const { data, error } = await supabase
    .from('message_day_summaries')
    .select('id, org_id, date, summary, message_count, created_at')
    .eq('org_id', orgId)
    .order('date', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    orgId: row.org_id,
    date: row.date,
    summary: row.summary,
    messageCount: row.message_count ?? 0,
    createdAt: new Date(row.created_at),
  }));
}
