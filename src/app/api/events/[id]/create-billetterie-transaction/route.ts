import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrgIntegration, type ShotgunCredentials } from '@/lib/supabase/integrations';
import { generateUniqueCode } from '@/lib/utils/generateCode';
import type { ShotgunTicket } from '@/types/shotgun';

const SHOTGUN_TICKETS_URL = 'https://api.shotgun.live/tickets';

async function getShotgunCredentials(supabase: Awaited<ReturnType<typeof createClient>>, orgId: string | null): Promise<ShotgunCredentials | null> {
  if (orgId) {
    const creds = await getOrgIntegration<ShotgunCredentials>(supabase, orgId, 'shotgun');
    if (creds) return creds;
  }
  const organizerId = process.env.SHOTGUN_ORGANIZER_ID;
  const apiToken = process.env.SHOTGUN_API_TOKEN;
  if (organizerId && apiToken) {
    return { organizerId, apiToken };
  }
  return null;
}

function computeTotalRevenue(tickets: ShotgunTicket[]): number {
  const valid = tickets.filter((t) => t.ticket_status === 'valid');
  return valid.reduce((sum, t) => sum + t.deal_price, 0);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const supabase = await createClient();

  // 1. Charger l'event
  const { data: eventRow, error: eventError } = await supabase
    .from('events')
    .select('id, name, status, shotgun_event_id, org_id')
    .eq('id', eventId)
    .single();

  if (eventError || !eventRow) {
    return NextResponse.json({ error: 'Event introuvable' }, { status: 404 });
  }

  const event = eventRow as { id: string; name: string; status: string; shotgun_event_id: number | null; org_id: string | null };
  const orgId = event.org_id ?? request.headers.get('X-Org-Id');

  if (event.status !== 'completed') {
    return NextResponse.json({ error: "L'event n'est pas au statut terminé" }, { status: 400 });
  }

  if (!event.shotgun_event_id) {
    return NextResponse.json(
      { error: "Aucun event Shotgun lié. La transaction billetterie n'a pas été créée." },
      { status: 400 }
    );
  }

  // 2. Vérifier qu'une transaction billetterie n'existe pas déjà pour cet event
  const labelPrefix = `Billetterie - ${event.name}`;
  const { data: existing } = await supabase
    .from('finance_transactions')
    .select('id')
    .eq('event_id', eventId)
    .ilike('label', `${labelPrefix}%`)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { message: 'Une transaction billetterie existe déjà pour cet event', transactionId: existing.id },
      { status: 200 }
    );
  }

  // 3. Récupérer les tickets Shotgun
  const credentials = await getShotgunCredentials(supabase, orgId);
  if (!credentials) {
    return NextResponse.json(
      { error: 'Shotgun non configuré. Configurez l\'intégration dans Administration > Intégrations.' },
      { status: 400 }
    );
  }

  const allTickets: ShotgunTicket[] = [];
  let nextAfter: string | null = null;
  let hasMore = true;

  while (hasMore) {
    const url = new URL(SHOTGUN_TICKETS_URL);
    url.searchParams.set('organizer_id', credentials.organizerId);
    url.searchParams.set('event_id', String(event.shotgun_event_id));
    if (nextAfter) url.searchParams.set('after', nextAfter);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${credentials.apiToken}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Erreur Shotgun API: ${res.status}` },
        { status: 502 }
      );
    }

    const page = await res.json();
    allTickets.push(...(page.data ?? []));

    if (page.pagination?.next) {
      const nextUrl = new URL(page.pagination.next);
      nextAfter = nextUrl.searchParams.get('after');
      hasMore = !!nextAfter;
    } else {
      hasMore = false;
    }
  }

  const totalRevenue = computeTotalRevenue(allTickets);

  if (totalRevenue <= 0) {
    return NextResponse.json(
      { message: 'Aucun CA brut Shotgun pour cet event. Aucune transaction créée.' },
      { status: 200 }
    );
  }

  // 4. Créer la transaction
  const transactionId = crypto.randomUUID();
  const entryNumber = generateUniqueCode('TRA', transactionId, 8);
  const now = new Date().toISOString();
  const dateStr = now.slice(0, 10);
  const fiscalYear = new Date().getFullYear();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: inserted, error: insertError } = await supabase
    .from('finance_transactions')
    .insert({
      id: transactionId,
      entry_number: entryNumber,
      fiscal_year: fiscalYear,
      date: dateStr,
      label: labelPrefix,
      amount: totalRevenue,
      type: 'income',
      category: 'Billetterie',
      debit: 0,
      credit: totalRevenue,
      event_id: eventId,
      status: 'pending',
      vat_applicable: false,
      reconciled: false,
      org_id: orgId,
      created_by: user?.id ?? null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (insertError) {
    console.error('Create billetterie transaction error:', insertError);
    return NextResponse.json(
      { error: `Erreur lors de la création: ${insertError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: 'Transaction billetterie créée',
    transactionId: inserted.id,
    amount: totalRevenue,
    label: labelPrefix,
  });
}
