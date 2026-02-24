import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrgIntegration, type ShotgunCredentials } from '@/lib/supabase/integrations';

const SHOTGUN_TICKETS_URL = 'https://api.shotgun.live/tickets';

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
  const eventId = searchParams.get('event_id');
  const after = searchParams.get('after');
  const fetchAll = searchParams.get('fetch_all') === '1';

  const buildUrl = (afterParam?: string | null) => {
    const url = new URL(SHOTGUN_TICKETS_URL);
    url.searchParams.set('organizer_id', organizerId);
    if (eventId) url.searchParams.set('event_id', eventId);
    if (afterParam) url.searchParams.set('after', afterParam);
    return url;
  };

  try {
    if (fetchAll) {
      const allTickets: unknown[] = [];
      let nextAfter = after;
      let hasMore = true;

      while (hasMore) {
        const url = buildUrl(nextAfter);
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${apiToken}` },
        });

        if (!res.ok) {
          return NextResponse.json(
            { error: `Shotgun API error: ${res.status}` },
            { status: res.status }
          );
        }

        const page = await res.json();
        allTickets.push(...page.data);

        if (page.pagination?.next) {
          const nextUrl = new URL(page.pagination.next);
          nextAfter = nextUrl.searchParams.get('after');
          hasMore = true;
        } else {
          hasMore = false;
        }

        if (allTickets.length > 10000) {
          hasMore = false;
        }
      }

      return NextResponse.json({ data: allTickets, total: allTickets.length });
    }

    const url = buildUrl(after);
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Shotgun API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Shotgun tickets fetch error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch Shotgun tickets' },
      { status: 502 }
    );
  }
}
