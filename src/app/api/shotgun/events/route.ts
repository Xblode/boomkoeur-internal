import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrgIntegration, type ShotgunCredentials } from '@/lib/supabase/integrations';

const SHOTGUN_BASE = 'https://smartboard-api.shotgun.live/api/shotgun/organizers';

async function getShotgunCredentials(request: NextRequest): Promise<ShotgunCredentials | null> {
  const orgId = request.headers.get('X-Org-Id');
  if (orgId) {
    const supabase = await createClient();
    const creds = await getOrgIntegration<ShotgunCredentials>(supabase, orgId, 'shotgun');
    return creds;
  }
  const organizerId = process.env.SHOTGUN_ORGANIZER_ID;
  const apiToken = process.env.SHOTGUN_API_TOKEN;
  if (organizerId && apiToken) {
    return { organizerId, apiToken };
  }
  return null;
}

export async function GET(request: NextRequest) {
  const credentials = await getShotgunCredentials(request);
  if (!credentials) {
    return NextResponse.json(
      { error: 'Shotgun non configuré. Configurez l\'intégration dans Administration > Intégrations.' },
      { status: 400 }
    );
  }

  const { organizerId, apiToken } = credentials;
  const { searchParams } = request.nextUrl;
  const url = new URL(`${SHOTGUN_BASE}/${organizerId}/events`);
  url.searchParams.set('key', apiToken);

  const name = searchParams.get('name');
  if (name) url.searchParams.set('name', name);

  const pastEvents = searchParams.get('past_events');
  if (pastEvents) url.searchParams.set('past_events', pastEvents);

  const page = searchParams.get('page');
  if (page) url.searchParams.set('page', page);

  const limit = searchParams.get('limit');
  if (limit) url.searchParams.set('limit', limit);

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });

    if (!res.ok) {
      const body = await res.text();
      console.error('Shotgun API error:', res.status, body);
      return NextResponse.json(
        { error: `Shotgun API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const events = data?.data ?? [];
    console.log(`[Shotgun] Fetched ${events.length} events (params: ${url.searchParams.toString().replace(/key=[^&]+/, 'key=***')})`);
    events.forEach((e: any) => {
      console.log(`  → ${e.name} | id:${e.id} | published:${e.publishedAt ?? 'null'} | start:${e.startTime}`);
    });
    return NextResponse.json(data);
  } catch (err) {
    console.error('Shotgun events fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch Shotgun events' },
      { status: 502 }
    );
  }
}
