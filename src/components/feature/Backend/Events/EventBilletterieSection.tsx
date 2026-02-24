"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { SectionHeader } from '@/components/ui';
import { useEventDetail } from './EventDetailProvider';
import { useOrg } from '@/hooks';
import { ShotgunEvent, ShotgunDeal, ShotgunEventsResponse } from '@/types/shotgun';
import { Badge, Button } from '@/components/ui/atoms';
import { EmptyState, Card, CardContent } from '@/components/ui/molecules';
import {
  ExternalLink,
  Ticket,
  RefreshCw,
  Loader2,
  Users,
  Eye,
  EyeOff,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

const VISIBILITY_LABELS: Record<string, string> = {
  public: 'Public',
  promoters: 'Promoteurs',
  private: 'Privé',
};

const CHANNEL_LABELS: Record<string, string> = {
  online: 'En ligne',
  venue: 'Sur place',
  offline: 'Hors ligne',
  invitation: 'Invitation',
  distributor: 'Distributeur',
  duplicata: 'Accompagnant',
  pass_culture: 'Pass Culture',
};

export function EventBilletterieSection() {
  const { event } = useEventDetail();
  const { activeOrg } = useOrg();
  const [shotgunEvent, setShotgunEvent] = useState<ShotgunEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    if (!event.shotgunEventId) return;
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (activeOrg?.id) headers['X-Org-Id'] = activeOrg.id;
      const [futureRes, pastRes] = await Promise.all([
        fetch('/api/shotgun/events', { headers }),
        fetch('/api/shotgun/events?past_events=true&limit=50', { headers }),
      ]);
      const [futureJson, pastJson]: [ShotgunEventsResponse, ShotgunEventsResponse] =
        await Promise.all([futureRes.json(), pastRes.json()]);

      const all = [...(futureJson.data ?? []), ...(pastJson.data ?? [])];
      const match = all.find((e) => e.id === event.shotgunEventId);
      setShotgunEvent(match ?? null);
      if (!match) setError('Event Shotgun introuvable');
    } catch {
      setError('Impossible de charger la billetterie Shotgun');
    } finally {
      setLoading(false);
    }
  }, [event.shotgunEventId, activeOrg?.id]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  if (!event.shotgunEventId) {
    return (
      <EmptyState
        icon={Ticket}
        title="Aucun event Shotgun lié"
        description="Liez cet événement à Shotgun pour afficher la billetterie"
        variant="compact"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-sm text-zinc-500">
        <Loader2 size={16} className="animate-spin" />
        Chargement de la billetterie...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchDeals}>
          <RefreshCw size={14} className="mr-1" /> Réessayer
        </Button>
      </div>
    );
  }

  const deals = shotgunEvent?.deals ?? [];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={<Ticket size={28} />}
        title="Billetterie"
        subtitle="Tarifs, capacités et statistiques de vente."
      />
      {/* KPI bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {shotgunEvent && (
            <div className="flex items-center gap-2 text-sm">
              <Ticket size={16} className="text-zinc-500" />
              <span className="font-semibold">{shotgunEvent.leftTicketsCount}</span>
              <span className="text-zinc-500">places restantes</span>
            </div>
          )}
          <span className="text-xs text-zinc-400">{deals.length} tarif{deals.length > 1 ? 's' : ''}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDeals}>
            <RefreshCw size={14} />
          </Button>
          {event.shotgunEventUrl && (
            <a
              href={event.shotgunEventUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink size={14} className="mr-1" />
                Shotgun
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Deals grid */}
      {deals.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Aucun tarif configuré"
          description="Aucun tarif configuré sur cet event Shotgun"
          variant="inline"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.map((deal, idx) => (
            <DealCard key={deal.product_id ?? idx} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}

function DealCard({ deal }: { deal: ShotgunDeal }) {
  const totalPrice = deal.price + deal.user_fees;

  return (
    <Card variant="outline" className="bg-zinc-50 dark:bg-zinc-900/40">
      <CardContent className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold truncate">{deal.name}</h4>
          {deal.subcategory?.name && (
            <p className="text-xs text-zinc-500 mt-0.5">{deal.subcategory.name}</p>
          )}
        </div>
        <span className="text-lg font-bold tabular-nums shrink-0">
          {formatPrice(deal.price)}
        </span>
      </div>

      {/* Description */}
      {deal.description && (
        <p className="text-xs text-zinc-500 line-clamp-2">{deal.description}</p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="secondary" className="text-[10px] gap-1">
          {deal.visiblity === 'public' ? <Eye size={10} /> : <EyeOff size={10} />}
          {VISIBILITY_LABELS[deal.visiblity] ?? deal.visiblity}
        </Badge>
        <Badge variant="secondary" className="text-[10px] gap-1">
          <ShoppingCart size={10} />
          {CHANNEL_LABELS[deal.sales_channel] ?? deal.sales_channel}
        </Badge>
        <Badge variant="secondary" className="text-[10px] gap-1">
          <Users size={10} />
          {deal.quantity} places
        </Badge>
      </div>

      {/* Fees breakdown */}
      <div className="flex items-center gap-4 text-[11px] text-zinc-400 border-t border-border-custom pt-2">
        <span>Frais orga: {formatPrice(deal.organizer_fees)}</span>
        <span>Frais acheteur: {formatPrice(deal.user_fees)}</span>
        <span className={cn('ml-auto font-medium', 'text-zinc-600 dark:text-zinc-300')}>
          Total: {formatPrice(totalPrice)}
        </span>
      </div>
      </CardContent>
    </Card>
  );
}
