'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Services & Constants
import { getMeetings } from '@/lib/supabase/meetings';
import { CHART_SERIES_COLORS } from '@/lib/constants/chart-colors';
import { orderDataService } from '@/lib/services/OrderDataService';
import { productDataService } from '@/lib/services/ProductDataService';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getEvents } from '@/lib/supabase/events';
import { mockSocialPosts } from '@/lib/mocks/communication';

// Types
import type { Meeting } from '@/types/meeting';
import type { Order } from '@/types/order';
import type { Event, ComWorkflowPost } from '@/types/event';
import type { Invoice } from '@/types/finance';
import type { SocialPost } from '@/types/communication';

// Components
import { DashboardHero } from './DashboardHero';
import { DashboardKPIs } from './DashboardKPIs';
import { DashboardAlerts, type DashboardAlert } from './DashboardAlerts';
import { DashboardNextPostCard, type NextPostForDashboard } from './DashboardNextPostCard';
import { DashboardCharts } from './DashboardCharts';
import { DashboardActivity } from './DashboardActivity';
import { EventCard } from '@/components/feature/Backend/Events';
import MeetingCard from '@/components/feature/Backend/Meetings/MeetingCard';
import { CampaignWorkflowCard } from './CampaignWorkflowCard';
import { fadeInUp } from '@/lib/animations';

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

interface DashboardData {
  events: { inPreparation: Event[]; next: Event | null };
  communication: { postsToValidate: unknown[]; scheduledThisWeek: SocialPost[]; nextScheduledPost: NextPostForDashboard | null };
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [meetings, orders, products, events, transactions, invoices] = await Promise.all([
        getMeetings(),
        orderDataService.getOrders(),
        productDataService.getProducts(),
        getEvents(),
        financeDataService.getTransactions(),
        financeDataService.getInvoices(),
      ]);

      const eventsInPreparation = events.filter((e) => e.status === 'preparation');
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const upcomingEvents = events.filter((e) => {
        if (e.status === 'completed' || e.status === 'archived') return false;
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() >= now.getTime();
      });
      let nextEvent =
        upcomingEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ||
        null;
      if (!nextEvent && events.length > 0) {
        nextEvent = events
          .filter((e) => e.status !== 'archived')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
      }

      const postsToValidate = mockSocialPosts.filter(
        (p) => p.status === 'brainstorming' || p.status === 'created' || p.status === 'review'
      );
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const scheduledThisWeek = mockSocialPosts.filter(
        (p) => p.scheduledDate && p.scheduledDate >= now && p.scheduledDate <= weekFromNow
      );
      // Même source que Calendar: events.comWorkflow.posts
      const allScheduledPosts: { post: ComWorkflowPost; event: Event }[] = [];
      for (const e of events) {
        for (const p of e.comWorkflow?.posts ?? []) {
          if (p.scheduledDate && new Date(p.scheduledDate) >= now) {
            allScheduledPosts.push({ post: p, event: e });
          }
        }
      }
      allScheduledPosts.sort((a, b) => new Date(a.post.scheduledDate!).getTime() - new Date(b.post.scheduledDate!).getTime());
      const nextScheduledPostRaw = allScheduledPosts[0];
      let nextScheduledPost = nextScheduledPostRaw
        ? {
            id: nextScheduledPostRaw.post.id,
            eventId: nextScheduledPostRaw.event.id,
            name: nextScheduledPostRaw.post.name || 'Post',
            visuals: nextScheduledPostRaw.post.visuals?.map((v) => v.url) ?? [],
          }
        : null;
      // Fallback: si events n'ont pas de posts avec visuels, utiliser mockSocialPosts (URLs Unsplash fiables)
      if (!nextScheduledPost || nextScheduledPost.visuals.length === 0) {
        const mockWithMedia = mockSocialPosts
          .filter((p) => p.scheduledDate && new Date(p.scheduledDate) >= now)
          .sort((a, b) => (a.scheduledDate!.getTime() - b.scheduledDate!.getTime()))[0];
        if (mockWithMedia) {
          const mockVisuals: string[] = [];
          if (mockWithMedia.carouselSlides?.length) {
            mockWithMedia.carouselSlides.sort((a, b) => a.order - b.order).forEach((s) => s.image && mockVisuals.push(s.image));
          }
          if (mockVisuals.length === 0 && mockWithMedia.media?.length) mockVisuals.push(...mockWithMedia.media);
          if (mockVisuals.length > 0) {
            nextScheduledPost = {
              id: mockWithMedia.id,
              eventId: nextEvent?.id ?? 'fallback',
              name: mockWithMedia.brainstorming?.brief?.slice(0, 50) || 'Post',
              visuals: mockVisuals,
            };
          }
        }
      }

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

      const lowStockProducts = await productDataService.getLowStockProducts();

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

      setData({
        events: { inPreparation: eventsInPreparation, next: nextEvent },
        communication: { postsToValidate, scheduledThisWeek, nextScheduledPost },
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
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const alerts: DashboardAlert[] = [
    ...(data.products.lowStock.length > 0
      ? [{ id: 'low-stock', type: 'danger' as const, message: `${data.products.lowStock.length} rupture(s) stock`, link: '/dashboard/products' }]
      : []),
    ...(data.finance.overdueInvoices.length > 0
      ? [{ id: 'overdue', type: 'danger' as const, message: `${data.finance.overdueInvoices.length} facture(s) retard`, link: '/dashboard/finance' }]
      : []),
    ...(data.meetings.next && data.meetings.daysUntilNext !== null && data.meetings.daysUntilNext <= 7
      ? [{ id: 'meeting', type: 'warning' as const, message: `Réunion J-${data.meetings.daysUntilNext}`, link: '/dashboard/meetings' }]
      : []),
    ...(data.communication.postsToValidate.length > 0
      ? [{ id: 'posts', type: 'warning' as const, message: `${data.communication.postsToValidate.length} post(s) à valider`, link: data.events.next ? `/dashboard/events/${data.events.next.id}/campagne` : '/dashboard/events' }]
      : []),
  ];

  const currentMonthName = MONTH_NAMES[new Date().getMonth()];
  const previousMonthName = MONTH_NAMES[new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1];

  const comparisonData = [
    {
      name: previousMonthName,
      Revenus: data.finance.monthComparison.previous.revenue,
      Dépenses: data.finance.monthComparison.previous.expense,
    },
    {
      name: currentMonthName,
      Revenus: data.finance.monthComparison.current.revenue,
      Dépenses: data.finance.monthComparison.current.expense,
    },
  ];

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

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Prochain Event</h2>
          {data.events.next ? (
            <>
              <EventCard event={data.events.next} variant="compact" />
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
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Prochaine Réunion</h2>
          {data.meetings.next ? (
            <MeetingCard meeting={data.meetings.next} variant="compact" />
          ) : (
            <Link
              href="/dashboard/meetings"
              className="block rounded-md border border-border-custom bg-transparent p-4 text-center text-sm text-muted-foreground hover:bg-surface-subtle transition-colors"
            >
              Aucune réunion à venir
            </Link>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <DashboardAlerts data={{ alerts }} />
          <DashboardNextPostCard nextPost={data.communication.nextScheduledPost} />
        </div>

        <div className="lg:col-span-9 space-y-6">
          <DashboardCharts
            data={{
              comparisonData,
              revenueBreakdown: data.finance.revenueBreakdown,
            }}
          />

          <DashboardActivity
            data={{
              pendingOrders: data.orders.pending,
              scheduledPosts: data.communication.scheduledThisWeek,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
