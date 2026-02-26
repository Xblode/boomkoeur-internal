'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarDays, Users, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Spinner, Badge } from '@/components/ui/atoms';
import { TablePagination } from '@/components/ui/molecules';
import { getActivities, type Activity, type ActivityType } from '@/lib/activities';

const ITEMS_PER_PAGE = 30;

const TYPE_LABELS: Record<ActivityType, string> = {
  event: 'Événement',
  meeting: 'Réunion',
  product: 'Produit',
};

function getTypeIcon(type: ActivityType) {
  switch (type) {
    case 'event':
      return <CalendarDays className="w-3.5 h-3.5" />;
    case 'meeting':
      return <Users className="w-3.5 h-3.5" />;
    case 'product':
      return <Package className="w-3.5 h-3.5" />;
    default:
      return null;
  }
}

export default function AdminLogsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const offset = (page - 1) * ITEMS_PER_PAGE;
    getActivities({ limit: ITEMS_PER_PAGE, offset })
      .then(({ items, total: t }) => {
        setActivities(items);
        setTotal(t);
      })
      .catch(() => {
        setActivities([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Logs</h1>
        <p className="text-muted-foreground">
          Historique des créations d&apos;événements, réunions et produits.
        </p>
      </div>

      <Card variant="outline" className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="md" />
            </div>
          ) : activities.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              Aucune activité enregistrée.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border-custom bg-surface-subtle/50">
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground w-24">
                        Date
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground w-28">
                        Type
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground w-36">
                        Créé par
                      </th>
                      <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">
                        Titre
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((a) => (
                      <tr
                        key={`${a.type}-${a.id}`}
                        className="border-b border-border-custom last:border-b-0 hover:bg-surface-subtle/50"
                      >
                        <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">
                          {a.createdAt.toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2 px-3">
                          <Badge variant="secondary" className="inline-flex items-center gap-1">
                            {getTypeIcon(a.type)}
                            {TYPE_LABELS[a.type]}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground text-xs">
                          {a.createdBy ?? '—'}
                        </td>
                        <td className="py-2 px-3">
                          <Link
                            href={a.url}
                            className="text-foreground hover:text-accent hover:underline truncate block max-w-md"
                          >
                            {a.title}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 pb-4">
                <TablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
