'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Instagram, Facebook, MessageCircle, Inbox, CalendarDays, Clock, ChevronRight } from 'lucide-react';

// Services & Constants
import { CHART_SERIES_COLORS } from '@/lib/constants/chart-colors';
import { orderDataService } from '@/lib/services/OrderDataService';
import { productDataService } from '@/lib/services/ProductDataService';
import { getCampaigns } from '@/lib/localStorage/communication';
import { useEvents, useMeetings, useTransactions, useInvoices } from '@/hooks';

// Types
import type { Meeting } from '@/types/meeting';
import type { Order } from '@/types/order';
import type { Event } from '@/types/event';
import type { Invoice } from '@/types/finance';
import type { SocialPost } from '@/types/communication';

// Components
import { DashboardHero } from './DashboardHero';
import { DashboardKPIs } from './DashboardKPIs';
import { EventCard } from '@/components/feature/Backend/Events';
import MeetingCard from '@/components/feature/Backend/Meetings/MeetingCard';
import { CampaignWorkflowCard } from './CampaignWorkflowCard';
import { EventSalesStats } from './EventSalesStats';
import { DashboardActivityFeed } from './DashboardActivityFeed';
import { Card, CardContent, CardHeader, CardTitle, EmptyState } from '@/components/ui/molecules';
import { Badge } from '@/components/ui/atoms';
import { fadeInUp } from '@/lib/animations';
import { useOrg } from '@/components/providers/OrgProvider';
import { getDemoOrders, getDemoOrderLines } from '@/lib/demo/seed-orders';

const ITEM_SIZE = 128; // Hauteur = EventCard compact lg (w-32 h-32)
const GAP = 8;
const VISIBLE_COUNT = 2;

function UpcomingEventsCarousel({ events }: { events: Event[] }) {
  const [index, setIndex] = React.useState(0);
  const maxIndex = Math.max(0, events.length - VISIBLE_COUNT);
  const step = VISIBLE_COUNT;
  const canNext = index < maxIndex;

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => Math.min(i + step, maxIndex));
  };

  const itemWidth = ITEM_SIZE + GAP;

  return (
    <div className="relative w-[calc(2*(128px+8px))] h-full min-h-[128px] flex-shrink-0 group/carousel self-stretch">
      <div className="overflow-hidden rounded-md h-full">
        <div
          className="flex gap-2 h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * itemWidth}px)` }}
        >
          {events.map((ev) => {
            const imgUrl = ev.media?.posterShotgun || ev.media?.posterInsta || ev.media?.posterA4;
            const hasImg = !!imgUrl;
            return (
              <Link
                key={ev.id}
                href={`/dashboard/events/${ev.id}`}
                className="w-32 h-32 flex-shrink-0 rounded-md overflow-hidden bg-zinc-800 border border-border-custom hover:border-zinc-500 transition-colors"
              >
                {hasImg ? (
                  <Image
                    src={imgUrl}
                    alt={ev.name}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CalendarDays size={32} className="text-zinc-600" aria-hidden />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
      {canNext && (
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-zinc-800 border border-border-custom shadow-md flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-zinc-700 z-10"
          aria-label="Voir les événements suivants"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      )}
    </div>
  );
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'instagram': return <Instagram className="w-3.5 h-3.5" />;
    case 'facebook': return <Facebook className="w-3.5 h-3.5" />;
    default: return <MessageCircle className="w-3.5 h-3.5" />;
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'brainstorming': return 'outline';
    case 'created': return 'secondary';
    case 'review': return 'warning';
    case 'validated': return 'success';
    case 'scheduled': return 'info';
    default: return 'default';
  }
}

interface ScheduledPostWithEvent extends SocialPost {
  eventId: string;
}

interface DashboardData {
  events: { inPreparation: Event[]; next: Event | null; upcomingOthers: Event[] };
  communication: { postsToValidate: unknown[]; scheduledPosts: ScheduledPostWithEvent[] };
  meetings: { next: Meeting | null; daysUntilNext: number | null; last: Meeting | null };
  orders: { pending: Order[]; count: number };
  products: { lowStock: unknown[] };
  finance: {
    revenueBreakdown: { source: string; amount: number; color: string }[];
    monthComparison: {
      current: { revenue: number; expense: number };
      previous: { revenue: number; expense: number };
    };
    overdueInvoices: Invoice[];
  };
}

export const DashboardStats: React.FC = () => {
  const { activeOrg, isLoading: orgLoading } = useOrg();
  const { events, isLoading: eventsLoading } = useEvents();
  const { meetings, isLoading: meetingsLoading } = useMeetings();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { invoices, isLoading: invoicesLoading } = useInvoices();

  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<unknown[]>([]);
  const [ordersProductsLoading, setOrdersProductsLoading] = useState(true);

  useEffect(() => {
    if (orgLoading || !activeOrg) return;

    if (activeOrg.slug === 'demo' && typeof window !== 'undefined') {
      const stored = localStorage.getItem('orders_demo');
      if (!stored || stored === '[]') {
        const demoOrders = getDemoOrders();
        const lines = getDemoOrderLines(demoOrders);
        localStorage.setItem('orders_demo', JSON.stringify(demoOrders));
        localStorage.setItem('order_lines_demo', JSON.stringify(lines));
      }
    }

    const loadOrdersAndProducts = async () => {
      setOrdersProductsLoading(true);
      try {
        const [ordersData, lowStock] = await Promise.all([
          orderDataService.getOrders(),
          productDataService.getLowStockProducts(),
        ]);
        setOrders(ordersData);
        setLowStockProducts(lowStock);
      } catch (error) {
        console.error('Erreur chargement orders/products:', error);
      } finally {
        setOrdersProductsLoading(false);
      }
    };
    loadOrdersAndProducts();
  }, [activeOrg, orgLoading]);

  const loading =
    orgLoading ||
    eventsLoading ||
    meetingsLoading ||
    transactionsLoading ||
    invoicesLoading ||
    ordersProductsLoading;

  const data = useMemo<DashboardData | null>(() => {
    if (loading) return null;

    const eventsInPreparation = events.filter((e) => e.status === 'preparation');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const upcomingEvents = events.filter((e) => {
      if (e.status === 'completed' || e.status === 'archived') return false;
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() >= now.getTime();
    });
    const sortedUpcoming = [...upcomingEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let nextEvent = sortedUpcoming[0] || null;
    if (!nextEvent && events.length > 0) {
      nextEvent =
        events
          .filter((e) => e.status !== 'archived')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
    }
    const upcomingOthers = nextEvent
      ? sortedUpcoming.filter((e) => e.id !== nextEvent!.id).slice(0, 5)
      : sortedUpcoming.slice(0, 5);

    const campaigns = getCampaigns();
    const postsToValidate: unknown[] = [];
    const scheduledPosts: ScheduledPostWithEvent[] = [];
    for (const campaign of campaigns) {
      if (!campaign.eventIds?.length) continue;
      const eventId = campaign.eventIds[0];
      for (const post of campaign.posts || []) {
        if (post.status === 'brainstorming' || post.status === 'created' || post.status === 'review') {
          postsToValidate.push(post);
        }
        if (post.scheduledDate) {
          scheduledPosts.push({ ...post, eventId });
        }
      }
    }
    scheduledPosts.sort(
      (a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime()
    );

    const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming' && m.date >= new Date());
    const nextMeeting = upcomingMeetings.sort((a, b) => a.date.getTime() - b.date.getTime())[0] || null;
    const daysUntilNext = nextMeeting
      ? Math.ceil((nextMeeting.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const completedMeetings = meetings.filter((m) => m.status === 'completed');
    const lastMeeting = completedMeetings.sort((a, b) => b.date.getTime() - a.date.getTime())[0] || null;

    const pendingOrders = orders.filter(
      (o) => o.status === 'pending_payment' || o.status === 'paid' || o.status === 'preparing'
    );

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        t.type === 'income' &&
        t.status === 'validated' &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      );
    });

    const revenueBySource: Record<string, number> = {};
    currentMonthTransactions.forEach((t) => {
      const category = t.category || 'Autre';
      revenueBySource[category] = (revenueBySource[category] || 0) + t.amount;
    });

    const revenueBreakdown = Object.entries(revenueBySource).map(([source, amount]) => ({
      source,
      amount,
      color: CHART_SERIES_COLORS[source] || CHART_SERIES_COLORS['Autre'],
    }));

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthRevenue = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const currentMonthExpense = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.status === 'validated' &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const previousMonthRevenue = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === 'income' &&
          t.status === 'validated' &&
          tDate.getMonth() === previousMonth &&
          tDate.getFullYear() === previousMonthYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const previousMonthExpense = transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          t.status === 'validated' &&
          tDate.getMonth() === previousMonth &&
          tDate.getFullYear() === previousMonthYear
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const overdueInvoices = invoices.filter((inv) => {
      const invoice = inv as Invoice & { invoice_lines: unknown[] };
      return invoice.status === 'overdue';
    });

    return {
      events: { inPreparation: eventsInPreparation, next: nextEvent, upcomingOthers },
      communication: { postsToValidate, scheduledPosts },
      meetings: { next: nextMeeting, daysUntilNext, last: lastMeeting },
      orders: { pending: pendingOrders, count: pendingOrders.length },
      products: { lowStock: lowStockProducts },
      finance: {
        revenueBreakdown,
        monthComparison: {
          current: { revenue: currentMonthRevenue, expense: currentMonthExpense },
          previous: { revenue: previousMonthRevenue, expense: previousMonthExpense },
        },
        overdueInvoices: overdueInvoices.map((inv) => inv as Invoice & { invoice_lines: unknown[] }),
      },
    };
  }, [
    loading,
    events,
    meetings,
    transactions,
    invoices,
    orders,
    lowStockProducts,
  ]);

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const revenueChange =
    data.finance.monthComparison.previous.revenue > 0
      ? Number(
          (
            ((data.finance.monthComparison.current.revenue - data.finance.monthComparison.previous.revenue) /
              data.finance.monthComparison.previous.revenue) *
            100
          ).toFixed(1)
        )
      : 100;

  return (
    <motion.div
      className="w-full space-y-6"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <DashboardHero />

      <DashboardKPIs
        data={{
          revenue: data.finance.monthComparison.current.revenue,
          revenueChange,
          ordersCount: data.orders.count,
          eventsInPreparation: data.events.inPreparation.length,
          postsToValidate: data.communication.postsToValidate.length,
        }}
      />

      {/* Desktop: 2 colonnes (30% gauche, 70% droite). Mobile: empilé, Prochain Event en premier */}
      <section className="flex flex-col gap-6 lg:grid lg:grid-cols-[3fr_7fr] lg:gap-6">
        {/* Colonne gauche (30%) — Prochaine réunion + Ordre du jour + Planning social */}
        <div className="flex flex-col gap-3 order-2 lg:order-1">
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Prochaine Réunion</h2>
            {data.meetings.next ? (
              <>
                <MeetingCard meeting={data.meetings.next} variant="compact" />
                {/* Ordre du jour — card sans bg ni border, slider horizontal */}
                {data.meetings.next.agenda && data.meetings.next.agenda.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">
                      Ordre du jour
                    </h3>
                    <Card variant="none" className="overflow-visible w-full">
                      <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory w-full">
                        <div className="flex gap-2">
                          {[...data.meetings.next.agenda]
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                            .map((item) => (
                              <Link
                                key={item.id}
                                href={`/dashboard/meetings/${data.meetings.next!.id}`}
                                className="flex flex-col gap-1 p-3 rounded-lg shrink-0 w-full min-w-full snap-start text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                              >
                                <span className="text-sm font-medium text-foreground line-clamp-2">
                                  {item.title}
                                </span>
                                {item.duration > 0 && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock size={10} />
                                    {item.duration} min
                                  </span>
                                )}
                              </Link>
                            ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/dashboard/meetings"
                className="block rounded-md border border-border-custom bg-transparent p-4 text-center text-sm text-muted-foreground hover:bg-surface-subtle transition-colors"
              >
                Aucune réunion à venir
              </Link>
            )}
          </div>

          <div>
            <Card variant="outline" className="overflow-hidden">
              <CardHeader className="p-2 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold">
                  Planning social
                </CardTitle>
                <Link
                  href="/dashboard/events"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                {data.communication.scheduledPosts.length > 0 ? (
                  <ul className="space-y-2">
                    {data.communication.scheduledPosts.slice(0, 3).map((post) => (
                      <li key={post.id}>
                        <Link href={`/dashboard/events/${post.eventId}/campagne`}>
                          <motion.div
                            className="flex items-center justify-between p-3 rounded-lg transition-colors group bg-surface-elevated border border-border-custom hover:bg-surface-subtle hover:border-border-custom/80 cursor-pointer"
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                                {getPlatformIcon(post.platform)}
                              </span>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium capitalize group-hover:underline truncate">
                                  {post.type}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {post.scheduledDate &&
                                    new Date(post.scheduledDate).toLocaleDateString('fr-FR', {
                                      weekday: 'short',
                                      day: 'numeric',
                                    })}
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant={getStatusBadgeVariant(post.status)}
                              className="text-xs flex-shrink-0"
                            >
                              {post.status}
                            </Badge>
                          </motion.div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Inbox className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm font-medium text-foreground">Aucun post planifié</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Planifiez vos publications dans les campagnes de vos événements
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Colonne droite (70%) — Prochain Event + Compte rendu dernière réunion */}
        <div className="space-y-6 order-1 lg:order-2">
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Prochain Event</h2>
            {data.events.next ? (
              <>
                {/* Desktop: layout horizontal — main card à gauche, carousel à droite */}
                <div className="hidden lg:flex lg:gap-4 lg:items-stretch">
                  <div className="flex-1 min-w-0">
                    <EventCard event={data.events.next} variant="compact" compactSize="lg" />
                  </div>
                  {data.events.upcomingOthers.length > 0 && (
                    <UpcomingEventsCarousel events={data.events.upcomingOthers} />
                  )}
                </div>
                {/* Mobile: layout vertical empilé */}
                <div className="lg:hidden space-y-3">
                  <EventCard event={data.events.next} variant="compact" compactSize="lg" />
                </div>
                <div className="mt-3 space-y-2">
                  <h3 className="text-sm font-medium text-foreground">Campagne</h3>
                  {data.events.next.comWorkflow ? (
                    <CampaignWorkflowCard event={data.events.next} />
                  ) : (
                    <Link
                      href={`/dashboard/events/${data.events.next.id}/campagne`}
                      className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Démarrer la campagne →
                    </Link>
                  )}
                  <EventSalesStats event={data.events.next} />
                </div>
              </>
            ) : (
              <Link
                href="/dashboard/events"
                className="block rounded-md border border-border-custom bg-transparent p-4 text-center text-sm text-muted-foreground hover:bg-surface-subtle transition-colors"
              >
                Aucun événement à venir
              </Link>
            )}
          </div>

          {/* Compte rendu de la dernière réunion */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                Compte rendu de la dernière réunion
              </h3>
              {data.meetings.last && (
                <Link
                  href="/dashboard/meetings"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  Voir les réunions <ArrowRight size={12} />
                </Link>
              )}
            </div>
            {data.meetings.last ? (
              (() => {
                const lastMeeting = data.meetings.last;
                const hasMinutes = !!lastMeeting.minutes?.freeText?.trim();
                return (
                  <Card variant="outline" className="overflow-hidden">
                    {hasMinutes ? (
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          {lastMeeting.title} —{' '}
                          {new Date(lastMeeting.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <div className="text-sm text-foreground whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                          {lastMeeting.minutes?.freeText ?? ''}
                        </div>
                      </CardContent>
                    ) : (
                      <CardContent className="p-0">
                        <EmptyState
                          title="Aucun compte rendu rédigé"
                          description="La dernière réunion n'a pas encore de compte rendu."
                          action={
                            <Link
                              href="/dashboard/meetings"
                              className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                            >
                              Voir les réunions <ArrowRight size={14} />
                            </Link>
                          }
                          variant="compact"
                        />
                      </CardContent>
                    )}
                  </Card>
                );
              })()
            ) : (
              <Card variant="outline" className="overflow-hidden">
                <CardContent className="p-0">
                  <EmptyState
                    title="Aucune réunion passée"
                    description="Les comptes rendus des réunions apparaîtront ici."
                    action={
                      <Link
                        href="/dashboard/meetings"
                        className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                      >
                        Voir les réunions <ArrowRight size={14} />
                      </Link>
                    }
                    variant="compact"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Activités récentes */}
          <DashboardActivityFeed />
        </div>
      </section>
    </motion.div>
  );
};
