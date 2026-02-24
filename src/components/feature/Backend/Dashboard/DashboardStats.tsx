'use client';

import React, { useState, useEffect } from 'react';
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
import type { Event } from '@/types/event';
import type { Invoice } from '@/types/finance';
import type { SocialPost } from '@/types/communication';

// Components
import { DashboardHero } from './DashboardHero';
import { DashboardKPIs } from './DashboardKPIs';
import { DashboardAlerts, type DashboardAlert } from './DashboardAlerts';
import { DashboardCharts } from './DashboardCharts';
import { DashboardActivity } from './DashboardActivity';
import { fadeInUp } from '@/lib/animations';

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

interface DashboardData {
  events: { inPreparation: Event[]; next: Event | null };
  communication: { postsToValidate: unknown[]; scheduledThisWeek: SocialPost[] };
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
      const upcomingEvents = events.filter((e) => e.status === 'confirmed' && e.date >= new Date());
      const nextEvent = upcomingEvents.sort((a, b) => a.date.getTime() - b.date.getTime())[0] || null;

      const postsToValidate = mockSocialPosts.filter(
        (p) => p.status === 'brainstorming' || p.status === 'created' || p.status === 'review'
      );
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const scheduledThisWeek = mockSocialPosts.filter(
        (p) => p.scheduledDate && p.scheduledDate >= now && p.scheduledDate <= weekFromNow
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
        communication: { postsToValidate, scheduledThisWeek },
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
      ? [{ id: 'posts', type: 'warning' as const, message: `${data.communication.postsToValidate.length} post(s) à valider`, link: '/dashboard/communication' }]
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <DashboardAlerts
            data={{
              alerts,
              nextEvent: data.events.next,
              nextMeeting: data.meetings.next,
              daysUntilNextMeeting: data.meetings.daysUntilNext,
            }}
          />
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
