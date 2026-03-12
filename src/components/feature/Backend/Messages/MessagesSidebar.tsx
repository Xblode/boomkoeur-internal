'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Hash,
  Zap,
  Bot,
  FileText,
  CalendarDays,
  Video,
  ChevronDown,
  ChevronUp,
  Smile,
  Calendar,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getDaySummaries, type DaySummary } from '@/lib/supabase/message-summaries';
import { Button } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import type { SendMessageInput } from '@/types/messages';

interface MessagesSidebarProps {
  orgId?: string | null;
  orgName?: string;
  journalRefreshKey?: number;
  currentPath?: string;
  onSendMessage?: (input: SendMessageInput) => Promise<void>;
  lastMessageId?: string | null;
  onAddReaction?: (messageId: string, emoji: string) => void;
  className?: string;
}

const DEMO_ACTIONS: {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  input: SendMessageInput;
}[] = [
  {
    id: 'system-plain',
    label: 'Message système',
    icon: Bot,
    description: 'Alerte générique',
    input: {
      content: 'Bienvenue dans la messagerie Boomkoeur ! Cet espace est dédié à la coordination de l\'équipe.',
      type: 'system',
    },
  },
  {
    id: 'post-reminder',
    label: 'Rappel post planifié',
    icon: FileText,
    description: 'Veille de publication',
    input: {
      content: 'Le post "Aftermovie Boom Festival" doit être publié demain.',
      type: 'system',
      relatedEntityType: 'post',
      metadata: {
        title: 'Aftermovie Boom Festival',
        status: 'Planifié',
        date: 'Demain à 18:00',
      },
    },
  },
  {
    id: 'event-update',
    label: 'Event confirmé (Shotgun sync)',
    icon: CalendarDays,
    description: 'Lieu, artistes, billets',
    input: {
      content: 'L\'événement "Boom Summer 2026" vient d\'être mis à jour.',
      type: 'system',
      relatedEntityType: 'event',
      metadata: {
        title: 'Boom Summer 2026',
        status: 'Confirmé',
        date: '21 juin 2026',
        eventStatus: 'confirmed',
        location: 'Boom Festival, Cluys',
        artists: ['Charlotte de Witte', 'Amelie Lens'],
        shotgunSynced: true,
        ticketCount: 1247,
      },
    },
  },
  {
    id: 'event-no-shotgun',
    label: 'Event sans Shotgun',
    icon: CalendarDays,
    description: 'Affiche "Non synchronisé"',
    input: {
      content: 'L\'événement "Soirée privée" est en préparation.',
      type: 'system',
      relatedEntityType: 'event',
      metadata: {
        title: 'Soirée privée',
        status: 'Préparation',
        date: '10 mai 2026',
        eventStatus: 'preparation',
        location: 'Bruxelles',
        artists: ['DJ Local'],
        shotgunSynced: false,
      },
    },
  },
  {
    id: 'event-preparation',
    label: 'Event en préparation',
    icon: CalendarDays,
    description: 'Phase com + prochaines étapes',
    input: {
      content: 'L\'événement "Afterwork Q2" est en préparation.',
      type: 'system',
      relatedEntityType: 'event',
      metadata: {
        title: 'Afterwork Q2',
        status: 'Préparation',
        date: '15 mai 2026',
        eventStatus: 'preparation',
        location: 'Bruxelles',
        comWorkflowPhase: 'Production',
        nextActions: ['Finaliser les visuels', 'Lancer la billetterie'],
      },
    },
  },
  {
    id: 'event-completed',
    label: 'Event terminé',
    icon: CalendarDays,
    description: 'Bilan post-event',
    input: {
      content: 'L\'événement "Boom Festival 2025" est terminé.',
      type: 'system',
      relatedEntityType: 'event',
      metadata: {
        title: 'Boom Festival 2025',
        status: 'Terminé',
        date: '18 juillet 2025',
        eventStatus: 'completed',
        summary: '12 000 participants · Photos publiées · Bilan com en cours',
      },
    },
  },
  {
    id: 'meeting-reminder',
    label: 'Rappel réunion (avec ordre du jour)',
    icon: Video,
    description: 'Réunion imminente',
    input: {
      content: 'La réunion "Production Semaine 14" commence dans 1 heure.',
      type: 'system',
      relatedEntityType: 'meeting',
      metadata: {
        title: 'Production Semaine 14',
        status: 'À venir',
        date: 'Aujourd\'hui à 14:00',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        orderOfDay: [
          { title: 'Point budget Q2', duration: 15, responsible: 'Marie D.', description: 'Validation des prévisions trimestrielles' },
          { title: 'Revue des campagnes en cours', duration: 20, responsible: 'Thomas L.' },
          { title: 'Planning semaine prochaine', duration: 10 },
        ],
      },
    },
  },
  {
    id: 'meeting-no-agenda',
    label: 'Réunion sans ordre du jour',
    icon: Video,
    description: 'Badge d\'avertissement',
    input: {
      content: 'La réunion "Sync équipe" est prévue demain.',
      type: 'system',
      relatedEntityType: 'meeting',
      metadata: {
        title: 'Sync équipe',
        status: 'À venir',
        date: 'Demain à 10:00',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  },
  {
    id: 'meeting-report',
    label: 'Réunion passée (compte rendu)',
    icon: Video,
    description: 'Affiche le compte rendu',
    input: {
      content: 'La réunion "Rétro Sprint 12" s\'est tenue hier.',
      type: 'system',
      relatedEntityType: 'meeting',
      metadata: {
        title: 'Rétro Sprint 12',
        status: 'Terminée',
        date: 'Hier à 15:00',
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        report: 'Points positifs : livraison dans les temps, bonne collaboration.\n\nPoints à améliorer : clarifier les specs en amont.\n\nActions : créer une checklist de validation avant chaque sprint.',
      },
    },
  },
  {
    id: 'test-reactions',
    label: 'Message test réactions',
    icon: Smile,
    description: 'Test des emojis',
    input: {
      content: 'Testez les réactions emoji 👆 Survolez ce message et cliquez sur le + ou sur un emoji.',
    },
  },
  {
    id: 'test-date-sep',
    label: 'Messages pour séparateur',
    icon: Calendar,
    description: '2 messages (hier + aujourd\'hui)',
    input: { content: 'Message de test' }, // géré manuellement dans handleAction
  },
];

export function MessagesSidebar({ orgId, orgName, journalRefreshKey, currentPath = '', onSendMessage, lastMessageId, onAddReaction, className }: MessagesSidebarProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(true);
  const [journalEntries, setJournalEntries] = useState<DaySummary[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) {
      setJournalEntries([]);
      return;
    }
    setJournalLoading(true);
    getDaySummaries(orgId)
      .then(setJournalEntries)
      .catch(() => setJournalEntries([]))
      .finally(() => setJournalLoading(false));
  }, [orgId, journalRefreshKey]);

  const handleAddReaction = (emoji: string) => {
    if (lastMessageId && onAddReaction) onAddReaction(lastMessageId, emoji);
  };

  const handleAction = async (action: typeof DEMO_ACTIONS[number]) => {
    if (!onSendMessage || sending) return;
    setSending(action.id);
    try {
      if (action.id === 'test-date-sep') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(14, 30, 0, 0);
        await onSendMessage({
          content: 'Message d\'hier',
          createdAt: yesterday.toISOString(),
        });
        await onSendMessage({
          content: 'Message d\'aujourd\'hui',
        });
      } else {
        await onSendMessage(action.input);
      }
    } finally {
      setSending(null);
    }
  };

  return (
    <aside className={cn(
      'hidden lg:flex flex-col w-60 shrink-0 border-r border-border-custom bg-backend',
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 h-12 border-b border-border-custom shrink-0">
        <MessageSquare size={16} className="text-zinc-500" />
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Messages</span>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <Link
          href="/dashboard/messages"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            !currentPath.endsWith('/journal')
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
          )}
        >
          <Hash size={14} className="text-zinc-400 shrink-0" />
          <span className="truncate">Messages</span>
        </Link>

        {/* Journal */}
        <div className="mt-3">
          <Link
            href="/dashboard/messages/journal"
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group',
              currentPath.endsWith('/journal')
                ? 'bg-zinc-100 dark:bg-zinc-800'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            <BookOpen size={14} className="text-blue-500 shrink-0" />
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex-1">
              Journal
            </span>
            <ExternalLink size={12} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
          </Link>

          {journalOpen && (
            <div className="mt-1 space-y-2 pl-1 max-h-48 overflow-y-auto">
              {journalLoading ? (
                <p className="text-[11px] text-zinc-400 px-2.5 py-2">Chargement…</p>
              ) : journalEntries.length === 0 ? (
                <p className="text-[11px] text-zinc-400 px-2.5 py-2">
                  Aucun résumé. <Link href="/dashboard/messages/journal" className="text-blue-500 hover:underline">Voir le journal</Link>
                </p>
              ) : (
                <>
                  {journalEntries.slice(0, 3).map((entry) => (
                    <Link
                      key={entry.id}
                      href="/dashboard/messages/journal"
                      className="block px-2.5 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                        {format(new Date(entry.date + 'T12:00:00'), 'EEEE d MMMM', { locale: fr }).replace(/^./, (c) => c.toUpperCase())} · {entry.messageCount} msg
                      </p>
                      <p className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed line-clamp-2">
                        {entry.summary}
                      </p>
                    </Link>
                  ))}
                  {journalEntries.length > 3 && (
                    <Link
                      href="/dashboard/messages/journal"
                      className="block text-[11px] text-blue-500 hover:underline px-2.5 py-1"
                    >
                      + {journalEntries.length - 3} autre{journalEntries.length - 3 > 1 ? 's' : ''}…
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions section */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setActionsOpen(!actionsOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Zap size={14} className="text-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide flex-1">
              Actions
            </span>
            {actionsOpen ? (
              <ChevronUp size={12} className="text-zinc-400" />
            ) : (
              <ChevronDown size={12} className="text-zinc-400" />
            )}
          </button>

          {actionsOpen && (
            <div className="mt-1 space-y-0.5 pl-1">
              {lastMessageId && onAddReaction && (
                <div className="mb-2 pb-2 border-b border-zinc-200 dark:border-zinc-700">
                  <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide px-2.5 mb-1.5">
                    Réaction sur dernier message
                  </p>
                  <div className="flex gap-1 flex-wrap">
                    {['👍', '❤️', '😂', '🔥'].map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddReaction(emoji)}
                        className="h-8 w-8 p-0 text-lg"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {DEMO_ACTIONS.map((action) => {
                const Icon = action.icon;
                const isLoading = sending === action.id;
                return (
                  <Button
                    key={action.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(action)}
                    disabled={!!sending}
                    className="w-full justify-start gap-2 h-auto py-2 px-2.5 text-left font-normal"
                  >
                    <Icon size={14} className={cn('shrink-0', isLoading ? 'animate-pulse text-amber-500' : 'text-zinc-400')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{action.label}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{action.description}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer context */}
      {orgName && (
        <div className="px-4 py-3 border-t border-border-custom">
          <p className="text-[11px] text-zinc-400 truncate">{orgName}</p>
        </div>
      )}
    </aside>
  );
}
