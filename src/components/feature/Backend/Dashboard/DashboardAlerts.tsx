'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Inbox } from 'lucide-react';
import { Card } from '@/components/ui/molecules';
import { fadeInUp } from '@/lib/animations';

export interface DashboardAlert {
  id: string;
  type: 'danger' | 'warning';
  message: string;
  link: string;
}

export interface DashboardAlertsData {
  alerts: DashboardAlert[];
}

interface DashboardAlertsProps {
  data: DashboardAlertsData;
}

export function DashboardAlerts({ data }: DashboardAlertsProps) {
  const hasAlerts = data.alerts.length > 0;

  if (!hasAlerts) {
    return (
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Card className="rounded-lg shadow-sm border border-border-custom">
          <div className="p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Attention requise</p>
            <div className="flex items-center gap-2 py-2 text-center">
              <Inbox className="w-5 h-5 text-muted-foreground opacity-50 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">Aucune alerte</span>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <Card className="rounded-lg shadow-sm border border-border-custom">
        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />
            <p className="text-xs font-medium text-muted-foreground">Attention requise</p>
          </div>
          <ul className="flex flex-col gap-0.5">
            {data.alerts.map((alert) => (
              <li key={alert.id}>
                <Link
                  href={alert.link}
                  className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded hover:bg-surface-subtle transition-colors group min-w-0"
                >
                  <span
                    className={`flex-1 min-w-0 truncate text-xs font-medium ${
                      alert.type === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {alert.message}
                  </span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </motion.div>
  );
}
