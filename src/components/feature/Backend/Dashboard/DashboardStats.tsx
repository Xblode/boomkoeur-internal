'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  AlertCircle,
  Package,
  FileText,
  CheckCircle,
  Music,
  MapPin,
  Clock,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Instagram,
  Facebook,
  MessageCircle,
  MoreHorizontal,
  DollarSign,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/molecules';
import { Badge } from '@/components/ui/atoms';
import { Button } from '@/components/ui/atoms';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Services
import { meetingService } from '@/lib/services/MeetingService';
import { orderDataService } from '@/lib/services/OrderDataService';
import { productDataService } from '@/lib/services/ProductDataService';
import { financeDataService } from '@/lib/services/FinanceDataService';
import { getEvents } from '@/lib/localStorage/events';
import { mockSocialPosts } from '@/lib/mocks/communication';

// Types
import type { Meeting } from '@/types/meeting';
import type { Order } from '@/types/order';
import type { Product } from '@/types/product';
import type { Event } from '@/types/event';
import type { SocialPost } from '@/types/communication';
import type { Transaction, Invoice } from '@/types/finance';

interface DashboardData {
  events: {
    inPreparation: Event[];
    next: Event | null;
  };
  communication: {
    postsToValidate: SocialPost[];
    scheduledThisWeek: SocialPost[];
  };
  meetings: {
    next: Meeting | null;
    daysUntilNext: number | null;
    last: Meeting | null;
  };
  orders: {
    pending: Order[];
    count: number;
  };
  products: {
    lowStock: Product[];
  };
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
        meetingService.getMeetings(),
        orderDataService.getOrders(),
        productDataService.getProducts(),
        Promise.resolve(getEvents()),
        financeDataService.getTransactions(),
        financeDataService.getInvoices(),
      ]);

      // Events
      const eventsInPreparation = events.filter((e) => e.status === 'preparation');
      const upcomingEvents = events.filter((e) => e.status === 'confirmed' && e.date >= new Date());
      const nextEvent = upcomingEvents.sort((a, b) => a.date.getTime() - b.date.getTime())[0] || null;

      // Communication
      const postsToValidate = mockSocialPosts.filter(
        (p) => p.status === 'brainstorming' || p.status === 'created' || p.status === 'review'
      );
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const scheduledThisWeek = mockSocialPosts.filter(
        (p) => p.scheduledDate && p.scheduledDate >= now && p.scheduledDate <= weekFromNow
      );

      // Meetings
      const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming' && m.date >= new Date());
      const nextMeeting = upcomingMeetings.sort((a, b) => a.date.getTime() - b.date.getTime())[0] || null;
      const daysUntilNext = nextMeeting
        ? Math.ceil((nextMeeting.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const completedMeetings = meetings.filter((m) => m.status === 'completed');
      const lastMeeting = completedMeetings.sort((a, b) => b.date.getTime() - a.date.getTime())[0] || null;

      // Orders
      const pendingOrders = orders.filter(
        (o) => o.status === 'pending_payment' || o.status === 'paid' || o.status === 'preparing'
      );

      // Products
      const lowStockProducts = await productDataService.getLowStockProducts();

      // Finance - Revenue breakdown
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

      const colors = {
        'Billetterie': '#22c55e',
        'Bar': '#3b82f6',
        'Merchandising': '#a855f7',
        'Adhésions': '#f59e0b',
        'Subventions': '#ec4899',
        'Autre': '#6b7280',
      };

      const revenueBreakdown = Object.entries(revenueBySource).map(([source, amount]) => ({
        source,
        amount,
        color: colors[source as keyof typeof colors] || colors['Autre'],
      }));

      // Finance - Month comparison
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

      // Overdue invoices
      const overdueInvoices = invoices.filter((inv) => {
        const invoice = inv as Invoice & { invoice_lines: any[] };
        return invoice.status === 'overdue';
      });

      setData({
        events: {
          inPreparation: eventsInPreparation,
          next: nextEvent,
        },
        communication: {
          postsToValidate,
          scheduledThisWeek,
        },
        meetings: {
          next: nextMeeting,
          daysUntilNext,
          last: lastMeeting,
        },
        orders: {
          pending: pendingOrders,
          count: pendingOrders.length,
        },
        products: {
          lowStock: lowStockProducts,
        },
        finance: {
          revenueBreakdown,
          monthComparison: {
            current: { revenue: currentMonthRevenue, expense: currentMonthExpense },
            previous: { revenue: previousMonthRevenue, expense: previousMonthExpense },
          },
          overdueInvoices: overdueInvoices.map((inv) => inv as Invoice & { invoice_lines: any[] }),
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
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Alerts
  const alerts = [
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-3.5 h-3.5" />;
      case 'facebook': return <Facebook className="w-3.5 h-3.5" />;
      case 'tiktok': return <MessageCircle className="w-3.5 h-3.5" />;
      default: return <MessageCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'brainstorming': return 'outline';
      case 'created': return 'secondary';
      case 'review': return 'warning';
      case 'validated': return 'success';
      case 'scheduled': return 'info';
      default: return 'default';
    }
  };

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentMonthName = monthNames[new Date().getMonth()];
  const previousMonthName = monthNames[new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1];

  const comparisonData = [
    { name: previousMonthName, Revenus: data.finance.monthComparison.previous.revenue, Dépenses: data.finance.monthComparison.previous.expense },
    { name: currentMonthName, Revenus: data.finance.monthComparison.current.revenue, Dépenses: data.finance.monthComparison.current.expense },
  ];

  const revenueChange = data.finance.monthComparison.previous.revenue > 0
    ? ((data.finance.monthComparison.current.revenue - data.finance.monthComparison.previous.revenue) / data.finance.monthComparison.previous.revenue * 100).toFixed(1)
    : '+100';

  return (
    <div className="w-full space-y-3">
      {/* 1. Top Stats Row - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Revenus */}
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">Revenus ({currentMonthName})</span>
              <DollarSign className="w-4 h-4 text-[#939393]" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.finance.monthComparison.current.revenue.toLocaleString('fr-FR')} €</div>
              <div className={`text-xs flex items-center mt-1 ${revenueChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {revenueChange.startsWith('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {revenueChange}% vs mois pr.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commandes */}
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">Commandes</span>
              <ShoppingCart className="w-4 h-4 text-[#939393]" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.orders.count}</div>
              <div className="text-xs text-muted-foreground mt-1">
                En attente de traitement
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Événements */}
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">Événements</span>
              <Music className="w-4 h-4 text-[#939393]" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.events.inPreparation.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                En cours de préparation
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication */}
        <Card>
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase">Communication</span>
              <MessageCircle className="w-4 h-4 text-[#939393]" />
            </div>
            <div>
              <div className="text-2xl font-bold">{data.communication.postsToValidate.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Posts à valider
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* COLONNE GAUCHE (3/12 - Très compacte) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Alertes Compactes */}
          {alerts.length > 0 && (
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                  Attention requise
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ul className="space-y-2 mt-2">
                  {alerts.map((alert) => (
                    <li key={alert.id}>
                      <Link href={alert.link} className="flex items-center justify-between text-xs hover:bg-accent/10 p-1 rounded transition-colors group">
                        <span className={`font-medium ${alert.type === 'danger' ? 'text-red-500' : 'text-yellow-600'}`}>
                          {alert.message}
                        </span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Prochain événement Compact */}
          {data.events.next ? (
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">Prochain événement</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="font-bold text-base line-clamp-1">{data.events.next.name}</div>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(data.events.next.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{data.events.next.location}</span>
                  </div>
                </div>
                <Link href="/dashboard/events">
                  <Button variant="outline" size="sm" className="w-full mt-3 h-7 text-xs">
                    Détails
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-4 text-center text-xs text-muted-foreground">Aucun événement à venir</Card>
          )}

          {/* Prochaine réunion Compact */}
          {data.meetings.next && (
            <Card>
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">Prochaine réunion</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="font-medium text-sm line-clamp-1">{data.meetings.next.title}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Dans {data.meetings.daysUntilNext} jour(s)
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* COLONNE DROITE (9/12) */}
        <div className="lg:col-span-9 space-y-3">
          
          {/* Row 1: Graphiques Côte à Côte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Graphique Bars */}
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm">Finances (Comparaison)</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                      <Tooltip 
                        contentStyle={{ fontSize: '12px', padding: '5px', borderRadius: '4px' }}
                        formatter={(value: number | undefined) => [`${value ?? 0} €`, '']}
                      />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="Revenus" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar dataKey="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Graphique Pie */}
            <Card>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm">Répartition Revenus</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="h-40 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.finance.revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="amount"
                      >
                        {data.finance.revenueBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '12px', padding: '5px', borderRadius: '4px' }} />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Listes Côte à Côte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Commandes Récentes */}
            <Card>
              <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">Commandes récentes</CardTitle>
                <Link href="/dashboard/products">
                  <ArrowRight className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </Link>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {data.orders.pending.length > 0 ? (
                  <ul className="space-y-2">
                    {data.orders.pending.slice(0, 3).map((order) => (
                      <li key={order.id}>
                        <Link 
                          href={`/dashboard/products?tab=orders&orderId=${order.id}`}
                          className="flex items-center justify-between text-sm p-2 rounded-md transition-colors cursor-pointer group bg-[#262626] border border-[#313133] hover:bg-[#333333]"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Package className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
                            <span className="font-medium truncate text-xs group-hover:underline">
                              {order.customer_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-mono">{order.total.toLocaleString('fr-FR')}€</span>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">{order.status}</Badge>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">Aucune commande en attente</p>
                )}
              </CardContent>
            </Card>

            {/* Posts Planifiés */}
            <Card>
              <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">Planning Social</CardTitle>
                <Link href="/dashboard/communication">
                  <ArrowRight className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </Link>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {data.communication.scheduledThisWeek.length > 0 ? (
                  <ul className="space-y-2">
                    {data.communication.scheduledThisWeek.slice(0, 3).map((post) => (
                      <li key={post.id}>
                        <Link 
                          href={`/dashboard/communication/${post.id}`}
                          className="flex items-center justify-between text-sm p-2 rounded-md transition-colors cursor-pointer group bg-[#262626] border border-[#313133] hover:bg-[#333333]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground group-hover:text-primary transition-colors">{getPlatformIcon(post.platform)}</span>
                            <div className="flex flex-col">
                              <span className="text-xs font-medium capitalize group-hover:underline">{post.type}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {post.scheduledDate && new Date(post.scheduledDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <Badge variant={getStatusBadgeVariant(post.status)} className="text-[10px] h-5 px-1.5">
                            {post.status}
                          </Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">Aucun post planifié cette semaine</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
