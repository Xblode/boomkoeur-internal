'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BookOpen, Sparkles } from 'lucide-react';
import { getDaySummaries, type DaySummary } from '@/lib/supabase/message-summaries';
import { useOrgOptional } from '@/components/providers/OrgProvider';
import { cn } from '@/lib/utils';

function SummaryContent({ summary }: { summary: string }) {
  return (
    <div className="space-y-1.5">
      {summary
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, i) => {
          const isBullet = /^[-•]\s/.test(line);
          const text = isBullet ? line.replace(/^[-•]\s+/, '').trim() : line;
          return (
            <div
              key={i}
              className={cn(
                'text-sm text-zinc-600 dark:text-zinc-300 break-words',
                isBullet && 'flex gap-2'
              )}
            >
              {isBullet && (
                <span className="shrink-0 text-zinc-400 dark:text-zinc-500">•</span>
              )}
              <span className={isBullet ? '' : 'italic'}>{text}</span>
            </div>
          );
        })}
    </div>
  );
}

export function JournalView() {
  const orgContext = useOrgOptional();
  const orgId = orgContext?.activeOrg?.id ?? null;
  const [entries, setEntries] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    getDaySummaries(orgId)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [orgId]);

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen size={48} className="text-zinc-300 dark:text-zinc-600 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400">Sélectionnez une organisation pour voir le journal.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Sparkles size={32} className="text-zinc-400 animate-pulse mb-4" />
        <p className="text-sm text-zinc-500">Chargement du journal…</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen size={48} className="text-zinc-300 dark:text-zinc-600 mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400 font-medium">Aucun résumé pour le moment</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1 max-w-md">
          Les synthèses IA des messages apparaîtront ici. Générez-en en consultant la messagerie et en faisant défiler les séparateurs de date.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen size={20} className="text-blue-500" />
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Journal</h1>
      </div>

      <div className="space-y-6">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm"
          >
            <header className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {format(new Date(entry.date + 'T12:00:00'), "EEEE d MMMM yyyy", { locale: fr }).replace(/^./, (c) => c.toUpperCase())}
              </h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                {entry.messageCount} message{entry.messageCount !== 1 ? 's' : ''}
              </span>
            </header>
            <SummaryContent summary={entry.summary} />
          </article>
        ))}
      </div>
    </div>
  );
}
