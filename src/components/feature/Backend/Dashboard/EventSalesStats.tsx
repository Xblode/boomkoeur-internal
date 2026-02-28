'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/molecules';
import { Ticket, Euro } from 'lucide-react';
import type { Event } from '@/types/event';
import type { ShotgunTicket } from '@/types/shotgun';
import { useOrg } from '@/hooks';

interface EventSalesStatsProps {
  event: Event;
}

export function EventSalesStats({ event }: EventSalesStatsProps) {
  const { activeOrg } = useOrg();
  const [tickets, setTickets] = useState<ShotgunTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!event.shotgunEventId) return;
    setLoading(true);
    setError(null);
    const headers: Record<string, string> = {};
    if (activeOrg?.id) headers['X-Org-Id'] = activeOrg.id;
    fetch(`/api/shotgun/tickets?event_id=${event.shotgunEventId}&fetch_all=1`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error('Erreur chargement');
        return res.json();
      })
      .then((json) => {
        setTickets(json.data ?? []);
      })
      .catch(() => setError('Indisponible'))
      .finally(() => setLoading(false));
  }, [event.shotgunEventId, activeOrg?.id]);

  if (!event.shotgunEventId) return null;

  const validTickets = tickets.filter((t) => t.ticket_status === 'valid');
  const placesVendues = validTickets.length;
  const caCents = validTickets.reduce((sum, t) => sum + t.deal_price, 0);
  const caEur = caCents / 100;

  const formatCa = (eur: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(eur);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Suivie des ventes</h3>
      <div className="flex gap-2">
        <Link
          href={`/dashboard/events/${event.id}/billetterie`}
          className="flex-1 min-w-0"
        >
          <Card
            variant="none"
            className="group flex items-center gap-3 py-2 px-3 transition-colors hover:bg-surface-subtle rounded-md"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-300">
              <Ticket size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Places vendues</p>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {loading ? '…' : error ? '—' : placesVendues}
              </p>
            </div>
          </Card>
        </Link>
        <Link
          href={`/dashboard/events/${event.id}/billetterie`}
          className="flex-1 min-w-0"
        >
          <Card
            variant="none"
            className="group flex items-center gap-3 py-2 px-3 transition-colors hover:bg-surface-subtle rounded-md"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800/80 text-zinc-400 group-hover:text-zinc-300">
              <Euro size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">CA</p>
              <p className="text-sm font-semibold text-foreground tabular-nums truncate">
                {loading ? '…' : error ? '—' : formatCa(caEur)}
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
