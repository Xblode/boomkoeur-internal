import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCalendarClient } from '@/lib/integrations/google';

async function ensureOrgMember(orgId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Non authentifié', status: 401 };
  }

  const { data } = await supabase.rpc('user_belongs_to_org', { oid: orgId });
  if (!data) {
    return { error: "Accès réservé aux membres de l'organisation", status: 403 };
  }
  return null;
}

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  const timeMin = request.nextUrl.searchParams.get('time_min');
  const timeMax = request.nextUrl.searchParams.get('time_max');

  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const authError = await ensureOrgMember(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const supabase = await createClient();
  const { data: orgRow, error: orgError } = await supabase
    .from('organisations')
    .select('google_calendar_id')
    .eq('id', orgId)
    .single();

  if (orgError || !orgRow) {
    return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
  }
  const googleCalendarIdRaw = orgRow.google_calendar_id;
  if (!googleCalendarIdRaw) {
    return NextResponse.json({ events: [] });
  }
  const calendarIds = googleCalendarIdRaw
    .split(',')
    .map((id: string) => id.trim())
    .filter(Boolean);

  const calendar = await getCalendarClient(orgId);
  if (!calendar) {
    return NextResponse.json(
      {
        error:
          'Google Calendar non connecté. Configurez l\'intégration dans Administration > Intégrations.',
      },
      { status: 400 }
    );
  }

  try {
    const now = new Date();
    const min = timeMin ? new Date(timeMin) : new Date(now.getFullYear(), now.getMonth(), 1);
    const max = timeMax
      ? new Date(timeMax)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    type GCalEvent = { id?: string; summary?: string; start?: { dateTime?: string; date?: string }; location?: string; htmlLink?: string };
    const mapEvent = (ev: GCalEvent) => {
      const start = ev.start?.dateTime
        ? new Date(ev.start.dateTime)
        : ev.start?.date
          ? new Date(ev.start.date)
          : new Date();
      return {
        id: ev.id ?? `gc-${Date.now()}-${Math.random()}`,
        title: ev.summary ?? 'Sans titre',
        date: start,
        time: ev.start?.dateTime ? start.toTimeString().slice(0, 5) : undefined,
        location: ev.location ?? undefined,
        type: 'google_calendar' as const,
        href: ev.htmlLink ?? undefined,
        source: ev,
      };
    };

    const fetchPromises = calendarIds.map((calendarId: string) =>
      calendar.events.list({
        calendarId,
        timeMin: min.toISOString(),
        timeMax: max.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      })
    );

    const responses = await Promise.all(fetchPromises);
    const allEvents = responses.flatMap((r) =>
      (r.data.items ?? []).map((ev: GCalEvent) => mapEvent(ev))
    );
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    return NextResponse.json({ events: allEvents });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erreur lors du chargement du calendrier';
    console.error('Calendar events error:', err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
