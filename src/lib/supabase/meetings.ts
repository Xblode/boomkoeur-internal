/**
 * Service Meetings - Supabase
 * Remplace lib/services/MeetingService (localStorage) pour le module Réunions
 */

import { supabase } from './client';
import { getActiveOrgId } from './activeOrg';
import type { Meeting, AgendaItem, MeetingInput, MeetingStats } from '@/types/meeting';

// --- Types DB (snake_case) ---
interface DbMeeting {
  id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  participants: unknown;
  status: string;
  agenda: unknown;
  minutes: unknown;
  calendar_event_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// --- Mappers ---
function mapDbMeetingToMeeting(row: DbMeeting): Meeting {
  const agenda = Array.isArray(row.agenda) ? row.agenda : [];
  const agendaItems: AgendaItem[] = agenda.map((a: Record<string, unknown>) => ({
    id: String(a.id ?? `agenda-${Date.now()}-${Math.random()}`),
    order: Number(a.order ?? 0),
    title: String(a.title ?? ''),
    description: a.description ? String(a.description) : undefined,
    duration: Number(a.duration ?? 0),
    responsible: a.responsible ? String(a.responsible) : undefined,
    documents: Array.isArray(a.documents) ? a.documents as AgendaItem['documents'] : [],
    requiresVote: Boolean(a.requiresVote ?? a.requires_vote ?? false),
    voteResult: (a.voteResult ?? a.vote_result) as AgendaItem['voteResult'] | undefined,
    notes: a.notes ? String(a.notes) : undefined,
  }));

  const minutesRaw = row.minutes as Record<string, unknown> | null;
  const freeTextVal = minutesRaw?.freeText ?? minutesRaw?.free_text;
  const minutes = {
    freeText: typeof freeTextVal === 'string' ? freeTextVal : '',
    createdAt: minutesRaw?.createdAt ? new Date(minutesRaw.createdAt as string) : undefined,
    updatedAt: minutesRaw?.updatedAt ? new Date(minutesRaw.updatedAt as string) : undefined,
  };

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    date: new Date(row.date),
    startTime: row.start_time ?? '09:00',
    endTime: row.end_time ?? '10:00',
    location: row.location ?? undefined,
    participants: Array.isArray(row.participants) ? row.participants as string[] : [],
    status: row.status as Meeting['status'],
    agenda: agendaItems,
    minutes,
    calendar_event_id: row.calendar_event_id ?? undefined,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

function meetingToDbPayload(meeting: Partial<Meeting> | Partial<MeetingInput>): Record<string, unknown> {
  const minutes = meeting.minutes ?? { freeText: '' };
  return {
    title: meeting.title ?? '',
    description: meeting.description ?? null,
    date: meeting.date instanceof Date ? meeting.date.toISOString() : meeting.date,
    start_time: meeting.startTime ?? '09:00',
    end_time: meeting.endTime ?? '10:00',
    location: meeting.location ?? null,
    participants: meeting.participants ?? [],
    status: meeting.status ?? 'upcoming',
    agenda: meeting.agenda ?? [],
    minutes: {
      freeText: minutes.freeText ?? '',
      createdAt: minutes.createdAt instanceof Date ? minutes.createdAt.toISOString() : minutes.createdAt,
      updatedAt: minutes.updatedAt instanceof Date ? minutes.updatedAt.toISOString() : minutes.updatedAt,
    },
    calendar_event_id: meeting.calendar_event_id ?? null,
    updated_at: new Date().toISOString(),
  };
}

// --- API ---

export async function getMeetings(): Promise<Meeting[]> {
  const orgId = getActiveOrgId();
  let query = supabase.from('meetings').select('*');
  if (orgId) query = query.eq('org_id', orgId);
  query = query.order('date', { ascending: false });
  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map((row: DbMeeting) => mapDbMeetingToMeeting(row));
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapDbMeetingToMeeting(data as DbMeeting);
}

export async function createMeeting(input: MeetingInput): Promise<Meeting> {
  const { data: { user } } = await supabase.auth.getUser();
  const createdBy = user?.id ?? null;

  const payload = meetingToDbPayload(input);
  const { data: inserted, error } = await supabase
    .from('meetings')
    .insert({
      ...payload,
      created_by: createdBy,
      org_id: getActiveOrgId(),
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbMeetingToMeeting(inserted as DbMeeting);
}

export async function updateMeeting(id: string, updates: Partial<MeetingInput>): Promise<Meeting | null> {
  const payload = meetingToDbPayload(updates);
  const { data, error } = await supabase
    .from('meetings')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return mapDbMeetingToMeeting(data as DbMeeting);
}

export async function deleteMeeting(id: string): Promise<boolean> {
  const { error } = await supabase.from('meetings').delete().eq('id', id);
  return !error;
}

export async function getMeetingStats(): Promise<MeetingStats> {
  const meetings = await getMeetings();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming' && new Date(m.date) >= now);
  const completedMeetings = meetings.filter((m) => m.status === 'completed');
  const meetingsThisMonth = meetings.filter(
    (m) => new Date(m.date) >= startOfMonth && new Date(m.date) <= endOfMonth
  );

  const totalDuration = meetings.reduce((sum, m) => {
    const [startH, startM] = m.startTime.split(':').map(Number);
    const [endH, endM] = m.endTime.split(':').map(Number);
    return sum + (endH * 60 + endM) - (startH * 60 + startM);
  }, 0);
  const averageDuration = meetings.length > 0 ? Math.round(totalDuration / meetings.length) : 0;

  const sortedUpcoming = [...upcomingMeetings].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const nextMeeting = sortedUpcoming[0];

  const meetingsWithMinutes = completedMeetings.filter(
    (m) => m.minutes.freeText && m.minutes.freeText.length > 0
  );
  const minutesCompletionRate =
    completedMeetings.length > 0
      ? Math.round((meetingsWithMinutes.length / completedMeetings.length) * 100)
      : 0;

  return {
    total_meetings: meetings.length,
    upcoming_meetings: upcomingMeetings.length,
    completed_meetings: completedMeetings.length,
    meetings_this_month: meetingsThisMonth.length,
    average_duration: averageDuration,
    next_meeting_date: nextMeeting?.date,
    minutes_completion_rate: minutesCompletionRate,
  };
}
