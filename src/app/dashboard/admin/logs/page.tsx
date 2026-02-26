'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarDays, Users, Package } from 'lucide-react';
import {
  Spinner,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/atoms';
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
    <div className="w-full space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Logs</h1>
        <p className="text-muted-foreground">
          Historique des créations d&apos;événements, réunions et produits.
        </p>
      </div>

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
          <div className="rounded-xl overflow-x-auto flex flex-col">
            <Table
              variant="default"
              resizable={false}
              statusColumn={false}
              selectionColumn={false}
              fillColumn={false}
            >
              <TableHeader>
                <TableRow hoverCellOnly>
                  <TableHead minWidth={100} defaultWidth={120} className="px-2">
                    Type
                  </TableHead>
                  <TableHead minWidth={100} defaultWidth={120} className="px-2">
                    Action
                  </TableHead>
                  <TableHead minWidth={160} defaultWidth={200}>
                    Date
                  </TableHead>
                  <TableHead minWidth={220} defaultWidth={400} className="px-3">
                    Titre
                  </TableHead>
                  <TableHead minWidth={180} defaultWidth={220} align="right">
                    Créé par
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((a) => (
                  <TableRow key={`${a.type}-${a.id}`}>
                    <TableCell noHoverBorder className="px-2">
                      <Badge variant="secondary" className="inline-flex items-center gap-1">
                        {getTypeIcon(a.type)}
                        {TYPE_LABELS[a.type]}
                      </Badge>
                    </TableCell>
                    <TableCell noHoverBorder className="px-2 text-sm">
                      {a.action === 'deleted' ? 'Supprimé' : 'Créé'}
                    </TableCell>
                    <TableCell noHoverBorder className="text-muted-foreground whitespace-nowrap text-sm">
                      {a.createdAt.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell noHoverBorder className="px-3">
                      <Link
                        href={a.url}
                        className="text-foreground hover:text-accent hover:underline truncate block w-full"
                      >
                        {a.title}
                      </Link>
                    </TableCell>
                    <TableCell noHoverBorder className="text-muted-foreground text-xs" align="right">
                      {a.createdBy ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="px-4 pb-4">
                <TablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
