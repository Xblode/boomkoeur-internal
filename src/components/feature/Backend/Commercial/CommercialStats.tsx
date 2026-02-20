'use client';

import { useState, useEffect } from 'react';
import { commercialService } from '@/lib/services/CommercialService';
import { CommercialStats as StatsType } from '@/types/commercial';
import { Users, UserCheck, UserPlus, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/molecules/Card';
import { Skeleton } from '@/components/ui/atoms';

export default function CommercialStats() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await commercialService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Contacts',
      value: stats.total_contacts,
      icon: Users,
      trend: '+2.5%',
      trendContext: 'depuis le mois dernier',
      trendColor: 'text-green-500',
    },
    {
      label: 'Contacts Actifs',
      value: stats.active_contacts,
      icon: UserCheck,
      trend: '+12%',
      trendContext: 'depuis la semaine dernière',
      trendColor: 'text-green-500',
    },
    {
      label: 'Nouveaux Leads',
      value: stats.new_leads,
      icon: UserPlus,
      trend: '+5',
      trendContext: 'depuis hier',
      trendColor: 'text-green-500',
    },
    {
      label: 'Activité (7j)',
      value: stats.recent_activity_count,
      icon: Activity,
      trend: '-4.5%',
      trendContext: 'vs 7 jours précédents',
      trendColor: 'text-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {stat.label}
                </p>
                <Icon className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {stat.value}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 flex items-center gap-1">
                <span className={`${stat.trendColor} flex items-center`}>
                  {stat.trend}
                </span>
                {stat.trendContext}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
