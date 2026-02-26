'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Users, Package } from 'lucide-react';
import { Card, CardContent, EmptyState } from '@/components/ui/molecules';
import { Spinner } from '@/components/ui/atoms';
import { getActivities, type Activity, type ActivityType } from '@/lib/activities';

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  event: 'Événement créé',
  meeting: 'Réunion créée',
  product: 'Produit créé',
};

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'event':
      return <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
    case 'meeting':
      return <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
    case 'product':
      return <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
    default:
      return null;
  }
}

export function DashboardActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivities({ limit: 4, offset: 0 })
      .then(({ items }) => setActivities(items))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Activités récentes</h3>
        <Card variant="outline" className="overflow-hidden">
          <CardContent className="p-6 flex justify-center">
            <Spinner size="sm" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Activités récentes</h3>
        <Link
          href="/dashboard/admin/logs"
          className="text-xs text-accent hover:underline flex items-center gap-1"
        >
          Voir les logs <ArrowRight size={12} />
        </Link>
      </div>
      {activities.length > 0 ? (
        <Card variant="outline" className="overflow-hidden">
          <CardContent className="p-0">
            <ul className="divide-y divide-border-custom">
              {activities.map((a) => (
                <li key={`${a.type}-${a.id}`}>
                  <Link
                    href={a.url}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-subtle transition-colors"
                  >
                    {getActivityIcon(a.type)}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ACTIVITY_LABELS[a.type]}
                        {a.createdBy && ` par ${a.createdBy}`}
                        {' · '}
                        {a.createdAt.toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outline" className="overflow-hidden">
          <CardContent className="p-0">
            <EmptyState
              title="Aucune activité récente"
              description="Les créations d'événements, réunions et produits apparaîtront ici."
              variant="compact"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
