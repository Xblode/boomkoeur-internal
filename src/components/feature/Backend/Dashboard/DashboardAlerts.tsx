'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { fadeInUp } from '@/lib/animations';
import type { Event } from '@/types/event';
import type { Meeting } from '@/types/meeting';

export interface DashboardAlert {
  id: string;
  type: 'danger' | 'warning';
  message: string;
  link: string;
}

export interface DashboardAlertsData {
  alerts: DashboardAlert[];
  nextEvent: Event | null;
  nextMeeting: Meeting | null;
  daysUntilNextMeeting: number | null;
}

interface DashboardAlertsProps {
  data: DashboardAlertsData;
}

export function DashboardAlerts({ data }: DashboardAlertsProps) {
  const hasAlerts = data.alerts.length > 0;
  const hasNextEvent = data.nextEvent != null;
  const hasNextMeeting = data.nextMeeting != null;
  const hasContent = hasAlerts || hasNextEvent || hasNextMeeting;

  if (!hasContent) {
    return (
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Card className="rounded-lg shadow-sm border-border-custom">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Inbox className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm font-medium text-foreground">Rien à faire</p>
            <p className="text-xs text-muted-foreground mt-1">
              Aucune alerte, événement ou réunion à venir
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {hasAlerts && (
        <Card className="rounded-lg shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Attention requise
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ul className="space-y-2">
              {data.alerts.map((alert) => (
                <li key={alert.id}>
                  <Link
                    href={alert.link}
                    className="flex items-center justify-between text-sm hover:bg-surface-subtle p-2 rounded-md transition-colors group"
                  >
                    <span
                      className={`font-medium ${
                        alert.type === 'danger' ? 'text-red-500' : 'text-amber-600 dark:text-amber-500'
                      }`}
                    >
                      {alert.message}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {hasNextEvent && (
        <Card className="rounded-lg shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prochain événement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="font-semibold text-base line-clamp-1">{data.nextEvent!.name}</div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>
                  {new Date(data.nextEvent!.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="line-clamp-1">{data.nextEvent!.location}</span>
              </div>
            </div>
            <Link href="/dashboard/events">
              <Button variant="outline" size="sm" className="w-full mt-4">
                Détails
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {hasNextMeeting && (
        <Link href="/dashboard/meetings">
          <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="rounded-lg shadow-sm hover:bg-surface-subtle/50 transition-colors cursor-pointer">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Prochaine réunion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="font-medium text-sm line-clamp-1">{data.nextMeeting!.title}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>Dans {data.daysUntilNextMeeting} jour(s)</span>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </Link>
      )}
    </motion.div>
  );
}
