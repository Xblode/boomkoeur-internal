'use client';

import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, Music, MessageCircle } from 'lucide-react';
import { KPICard } from '@/components/ui/molecules';
import { staggerContainer, staggerItem } from '@/lib/animations';

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export interface DashboardKPIsData {
  revenue: number;
  revenueChange: number;
  ordersCount: number;
  eventsInPreparation: number;
  postsToValidate: number;
}

interface DashboardKPIsProps {
  data: DashboardKPIsData;
}

export function DashboardKPIs({ data }: DashboardKPIsProps) {
  const currentMonthName = MONTH_NAMES[new Date().getMonth()];

  const kpis = [
    {
      id: 'revenue',
      label: `Revenus (${currentMonthName})`,
      value: data.revenue.toLocaleString('fr-FR'),
      unit: '€',
      icon: DollarSign,
      trend: data.revenueChange,
      trendLabel: 'vs mois pr.',
      subtext: undefined as string | undefined,
    },
    {
      id: 'orders',
      label: 'Commandes',
      value: data.ordersCount,
      unit: '',
      icon: ShoppingCart,
      subtext: 'En attente de traitement',
    },
    {
      id: 'events',
      label: 'Événements',
      value: data.eventsInPreparation,
      unit: '',
      icon: Music,
      subtext: 'En cours de préparation',
    },
    {
      id: 'communication',
      label: 'Communication',
      value: data.postsToValidate,
      unit: '',
      icon: MessageCircle,
      subtext: 'Posts à valider',
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {kpis.map((kpi) => (
        <motion.div key={kpi.id} variants={staggerItem}>
          <KPICard
            label={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            icon={kpi.icon}
            trend={kpi.trend}
            trendLabel={kpi.trendLabel}
            subtext={kpi.subtext}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
