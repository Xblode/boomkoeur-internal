'use client';

import { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Pin, PinOff, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveDaySummary, getDaySummary } from '@/lib/supabase/message-summaries';
import { HorizontalSeparator, MessageAvatarSlot } from './MessageParts';
import type { Message } from '@/types/messages';

interface MessageDateSeparatorProps {
  date: Date;
  previousDayMessages?: Message[];
  previousDayPinned?: Message[];
  orgId?: string | null;
  onTogglePin?: (messageId: string, pinned: boolean) => void;
  onNavigateToMessage?: (messageId: string) => void;
  onSummarySaved?: () => void;
  className?: string;
}

const summaryCache = new Map<string, string>();
const notifiedSummaryDays = new Set<string>();
const MIN_DELAY_MS = 12000;
let lastSummarizeAt = 0;

export function MessageDateSeparator({
  date,
  previousDayMessages = [],
  previousDayPinned = [],
  orgId,
  onTogglePin,
  onNavigateToMessage,
  onSummarySaved,
  className,
}: MessageDateSeparatorProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [regenerateTrigger, setRegenerateTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const label = format(date, "EEEE d MMMM", { locale: fr });
  const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);

  const hasSummary = previousDayMessages.length > 0;
  const prevDate = previousDayMessages[0] ? new Date(previousDayMessages[0].createdAt) : null;
  const prevDateLabel = prevDate ? format(prevDate, "EEEE d MMMM", { locale: fr }) : '';
  const cacheKey = prevDate ? format(prevDate, 'yyyy-MM-dd') : '';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setIsVisible(e.isIntersecting),
      { rootMargin: '100px', threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!hasSummary || previousDayMessages.length === 0 || !isVisible) {
      if (!isVisible && summaryLoading) setSummaryLoading(false);
      return;
    }
    const cached = cacheKey && regenerateTrigger === 0 ? summaryCache.get(cacheKey) : undefined;
    if (cached !== undefined) {
      setSummary(cached);
      setSummaryError(null);
      return;
    }
    let cancelled = false;
    let clearTimeoutFn: (() => void) | undefined;
    const doFetch = () => {
      if (cancelled) return;
      const delay = Math.max(0, MIN_DELAY_MS - (Date.now() - lastSummarizeAt));
      const timeout = setTimeout(() => {
        if (cancelled) return;
        lastSummarizeAt = Date.now();
        setSummaryLoading(true);
        setSummaryError(null);
        fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: previousDayMessages.map((m) => {
              const poll = m.metadata?.poll as { question?: string; options?: { id: string; label: string }[]; votes?: Record<string, string> } | undefined;
              const quickVote = m.metadata?.quickVote as { question?: string; yes?: string[]; no?: string[] } | undefined;
              const base: Record<string, unknown> = {
                author: m.author?.name ?? 'Système',
                content: m.content,
                type: m.type,
              };
              if (m.relatedEntityType) {
                base.entityType = m.relatedEntityType;
                base.entityTitle = (m.metadata?.title as string) ?? undefined;
              }
              if (poll?.question && poll.options) {
                const votes = poll.votes ?? {};
                const totalVotes = Object.keys(votes).length;
                base.poll = {
                  question: poll.question,
                  results: poll.options.map((o) => ({
                    label: o.label,
                    votes: Object.values(votes).filter((v) => v === o.id).length,
                  })),
                  totalVotes,
                };
              }
              if (quickVote) {
                base.quickVote = {
                  question: quickVote.question,
                  yes: (quickVote.yes ?? []).length,
                  no: (quickVote.no ?? []).length,
                  total: (quickVote.yes ?? []).length + (quickVote.no ?? []).length,
                };
              }
              return base;
            }),
          }),
        })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
              setSummaryError(data.error ?? 'Erreur');
              setSummary(null);
              return;
            }
            const s = data.summary ?? '';
            setSummary(s);
            if (cacheKey && s) summaryCache.set(cacheKey, s);
            if (orgId && cacheKey && s) {
              saveDaySummary(orgId, cacheKey, s, previousDayMessages.length).then(() => onSummarySaved?.()).catch(() => {});
            }
          })
          .catch(() => {
            setSummaryError('Impossible de charger la synthèse');
            setSummary(null);
          })
          .finally(() => {
            setSummaryLoading(false);
            setRegenerateTrigger(0);
          });
      }, delay);
      clearTimeoutFn = () => clearTimeout(timeout);
    };
    if (orgId && cacheKey && regenerateTrigger === 0) {
      getDaySummary(orgId, cacheKey)
        .then((s) => {
          if (cancelled) return;
          if (s?.summary) {
            setSummary(s.summary);
            summaryCache.set(cacheKey, s.summary);
            setSummaryError(null);
            return;
          }
          doFetch();
        })
        .catch(() => doFetch());
    } else {
      doFetch();
    }
    return () => {
      cancelled = true;
      clearTimeoutFn?.();
    };
  }, [hasSummary, cacheKey, previousDayMessages.length, isVisible, orgId, onSummarySaved, regenerateTrigger]);

  // Notification push quand on change de jour et que la synthèse est disponible
  useEffect(() => {
    if (!summary || summaryLoading || !isVisible || !cacheKey || !orgId || notifiedSummaryDays.has(cacheKey)) return;
    notifiedSummaryDays.add(cacheKey);
    fetch('/api/push/notify-summary-ready', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, dateLabel: prevDateLabel }),
    }).catch(() => {});
  }, [summary, summaryLoading, isVisible, cacheKey, prevDateLabel, orgId]);

  const handleRegenerate = () => {
    if (cacheKey) {
      summaryCache.delete(cacheKey);
      notifiedSummaryDays.delete(cacheKey);
    }
    setSummary(null);
    setSummaryError(null);
    setRegenerateTrigger((t) => t + 1);
  };

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      {hasSummary && (
        <div className="mb-3 px-2 sm:px-4 pt-3">
          <div className="flex items-end gap-2">
            <MessageAvatarSlot
              show
              entityIcon={Sparkles}
              entityAvatarBg="bg-zinc-100 dark:bg-zinc-800"
              entityIconColor="text-zinc-500 dark:text-zinc-400"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap pl-1">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {prevDateLabel} · {previousDayMessages.length} message{previousDayMessages.length > 1 ? 's' : ''}
                </span>
                {(summary || summaryError) && !summaryLoading && (
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    title="Regénérer la synthèse"
                    aria-label="Regénérer la synthèse"
                  >
                    <RefreshCw size={11} />
                    Regénérer
                  </button>
                )}
              </div>
              <div
                className={cn(
                  'inline-block max-w-[85%] min-w-0 px-2.5 sm:px-3.5 py-2 text-sm leading-relaxed',
                  'bg-surface-elevated text-zinc-800 dark:text-zinc-200',
                  'rounded-xl rounded-bl-md',
                )}
              >
                {summaryLoading && (
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                    <Sparkles size={12} className="animate-pulse" />
                    Synthèse en cours…
                  </p>
                )}
                {summary && !summaryLoading && (
                  <div className="space-y-1.5 min-w-0">
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
                              'text-[11px] text-zinc-600 dark:text-zinc-300 break-words',
                              isBullet && 'flex gap-2',
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
                )}
                {summaryError && !summaryLoading && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    {summaryError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {hasSummary && previousDayPinned.length > 0 && (
        <div className="mb-3 px-2 sm:px-4 pt-px">
          <div className="flex items-end gap-2">
            <MessageAvatarSlot
              show
              entityIcon={Pin}
              entityAvatarBg="bg-amber-100 dark:bg-amber-950/50"
              entityIconColor="text-amber-600 dark:text-amber-400"
            />
            <div className="min-w-0 flex-1">
              <div className="mb-1 pl-1">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  Messages épinglés
                </span>
              </div>
              <div
                className={cn(
                  'inline-block max-w-[85%] min-w-0 px-2.5 sm:px-3.5 py-2 text-sm leading-relaxed',
                  'bg-surface-elevated text-zinc-800 dark:text-zinc-200',
                  'rounded-xl rounded-bl-md',
                )}
              >
                <div className="space-y-2">
                  {previousDayPinned.map((msg) => (
                    <div
                      key={msg.id}
                      role={onNavigateToMessage ? 'button' : undefined}
                      tabIndex={onNavigateToMessage ? 0 : undefined}
                      onClick={onNavigateToMessage ? () => onNavigateToMessage(msg.id) : undefined}
                      onKeyDown={onNavigateToMessage ? (e) => e.key === 'Enter' && onNavigateToMessage(msg.id) : undefined}
                      className={cn(
                        'flex items-start gap-2 text-left',
                        onNavigateToMessage && 'cursor-pointer hover:opacity-90 transition-opacity',
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {msg.author?.name ?? 'Système'}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {format(new Date(msg.createdAt), 'HH:mm', { locale: fr })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                          {msg.content}
                        </p>
                      </div>
                      {onTogglePin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onTogglePin(msg.id, false);
                          }}
                          className="shrink-0 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-amber-500 transition-colors"
                          title="Désépingler"
                          aria-label="Désépingler"
                        >
                          <PinOff size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <HorizontalSeparator className="py-3">
        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          {capitalizedLabel}
        </span>
      </HorizontalSeparator>
    </div>
  );
}

/** @deprecated Use MessageDateSeparator instead */
export const DateSeparator = MessageDateSeparator;
