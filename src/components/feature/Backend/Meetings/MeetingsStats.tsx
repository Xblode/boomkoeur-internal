'use client';

import { useState, useEffect } from 'react';
import { meetingService } from '@/lib/services/MeetingService';
import { MeetingStats as StatsType } from '@/types/meeting';
import { Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/molecules/Card';
import { Skeleton } from '@/components/ui/atoms';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MeetingsStats() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await meetingService.getStats();
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
      label: 'Réunions ce mois',
      value: stats.meetings_this_month,
      icon: Calendar,
      description: 'Total',
    },
    {
      label: 'Durée moyenne',
      value: `${stats.average_duration}min`,
      icon: Clock,
      description: 'par réunion',
    },
    {
      label: 'Prochaine réunion',
      value: stats.next_meeting_date 
        ? format(stats.next_meeting_date, 'd MMM', { locale: fr })
        : '-',
      icon: CheckCircle,
      description: stats.next_meeting_date 
        ? format(stats.next_meeting_date, 'EEEE', { locale: fr })
        : 'Aucune prévue',
    },
    {
      label: 'Comptes-rendus',
      value: `${stats.minutes_completion_rate}%`,
      icon: FileText,
      description: 'complétés',
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
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
