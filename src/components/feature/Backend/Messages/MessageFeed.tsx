'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { startOfDay } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/ui/molecules';
import { Spinner } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import { MessageItem } from './MessageItem';
import { MessagePinnedBar } from './MessagePinnedBar';
import { MessageComposer } from './MessageComposer';
import { MessageDateSeparator } from './MessageDateSeparator';
import type { Message, MessageSeenByUser } from '@/types/messages';
import type { PickedEntity } from './MessageComposerModals';
import type { PollData } from './MessageComposerModals';

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildFeedItems(
  messages: Message[],
  pinnedMessages: Message[],
  now: Date
): Array<
  | { type: 'message'; message: Message; index: number }
  | { type: 'date'; date: Date; previousDayMessages: Message[]; previousDayPinned: Message[] }
> {
  const items: Array<
    | { type: 'message'; message: Message; index: number }
    | { type: 'date'; date: Date; previousDayMessages: Message[]; previousDayPinned: Message[] }
  > = [];
  let lastDate: Date | null = null;
  let previousDayMessages: Message[] = [];

  messages.forEach((msg, i) => {
    const msgDate = new Date(msg.createdAt);
    if (lastDate === null || !isSameDay(lastDate, msgDate)) {
      const prevPinned = lastDate
        ? previousDayMessages.filter((m) => pinnedMessages.some((p) => p.id === m.id))
        : [];
      items.push({
        type: 'date',
        date: msgDate,
        previousDayMessages: lastDate ? previousDayMessages : [],
        previousDayPinned: prevPinned,
      });
      previousDayMessages = [];
      lastDate = msgDate;
    }
    previousDayMessages.push(msg);
    items.push({ type: 'message', message: msg, index: i });
  });

  // À minuit : ajouter un séparateur "aujourd'hui" avec la synthèse de la veille, sans interaction utilisateur
  const today = startOfDay(now);
  const lastMsgDate = messages.length > 0 ? new Date(messages[messages.length - 1].createdAt) : null;
  const lastMsgDay = lastMsgDate ? startOfDay(lastMsgDate) : null;
  if (lastMsgDay && lastMsgDay < today && previousDayMessages.length > 0) {
    const lastDayPinned = previousDayMessages.filter((m) => pinnedMessages.some((p) => p.id === m.id));
    items.push({
      type: 'date',
      date: today,
      previousDayMessages,
      previousDayPinned: lastDayPinned,
    });
  }

  return items;
}

interface MessageFeedProps {
  messages: Message[];
  pinnedMessages: Message[];
  messageSeenByMap?: Map<string, MessageSeenByUser[]>;
  isLoading: boolean;
  isLoadingOlder?: boolean;
  hasMoreOlder?: boolean;
  onLoadMoreOlder?: () => void;
  error: string | null;
  onSend: (content: string, mentions?: PickedEntity[], memberMentions?: { id: string; name: string }[]) => void;
  onSendImage?: (file: File) => void;
  onSendDriveFile?: (url: string, name?: string, mimeType?: string) => void;
  onSendEntity?: (entity: PickedEntity) => void;
  onSendPoll?: (poll: PollData) => void;
  orgId?: string | null;
  currentUserId?: string | null;
  onTogglePin: (messageId: string, pinned: boolean) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onToggleImportant?: (messageId: string) => void;
  onVotePoll?: (messageId: string, optionId: string) => void;
  onVoteQuick?: (messageId: string, vote: 'yes' | 'no') => void;
  onEditPoll?: (messageId: string, poll: { question: string; options: { id: string; label: string }[] }) => void;
  onSendQuickVote?: (quickVote: { question?: string; yes: string[]; no: string[] }) => void;
  onDelete?: (messageId: string) => void;
  canDeleteSystemMessages?: boolean;
  canEditPoll?: boolean;
  canRegenerateSummary?: boolean;
  onSummarySaved?: () => void;
  className?: string;
}

export function MessageFeed({
  messages,
  pinnedMessages,
  messageSeenByMap = new Map(),
  isLoading,
  isLoadingOlder = false,
  hasMoreOlder = false,
  onLoadMoreOlder,
  error,
  onSend,
  onSendImage,
  onSendDriveFile,
  onSendEntity,
  onSendPoll,
  orgId,
  currentUserId,
  onTogglePin,
  onToggleReaction,
  onToggleImportant,
  onVotePoll,
  onVoteQuick,
  onEditPoll,
  onSendQuickVote,
  onDelete,
  canDeleteSystemMessages,
  canEditPoll = false,
  canRegenerateSummary = false,
  onSummarySaved,
  className,
}: MessageFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevLengthRef = useRef(messages.length);
  const initialScrollDoneRef = useRef(false);
  const scrollHeightBeforeLoadRef = useRef(0);
  const scrollTopBeforeLoadRef = useRef(0);
  const loadMoreTriggeredRef = useRef(false);

  // Mise à jour à minuit pour afficher le séparateur "aujourd'hui" automatiquement
  const [now, setNow] = useState(() => new Date());
  const midnightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const scheduleNextMidnight = () => {
      const d = new Date();
      const tomorrow = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      const msUntilMidnight = tomorrow.getTime() - d.getTime();
      midnightTimeoutRef.current = setTimeout(() => {
        setNow(new Date());
        scheduleNextMidnight();
      }, msUntilMidnight);
    };
    scheduleNextMidnight();
    return () => { if (midnightTimeoutRef.current) clearTimeout(midnightTimeoutRef.current); };
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
    }
  }, []);

  // Scroll initial une seule fois quand les messages sont chargés
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true;
      scrollToBottom('instant');
    }
  }, [isLoading, messages.length, scrollToBottom]);

  // Auto-scroll uniquement si déjà en bas et qu'un message est ajouté
  useEffect(() => {
    if (messages.length > prevLengthRef.current && isAtBottomRef.current) {
      scrollToBottom('smooth');
    }
    prevLengthRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 60;
    if (scrollTop < 150 && hasMoreOlder && !isLoadingOlder && !loadMoreTriggeredRef.current && onLoadMoreOlder) {
      scrollHeightBeforeLoadRef.current = el.scrollHeight;
      scrollTopBeforeLoadRef.current = el.scrollTop;
      loadMoreTriggeredRef.current = true;
      onLoadMoreOlder();
    }
  };

  // Restaure la position du scroll après chargement des messages plus anciens
  useEffect(() => {
    if (loadMoreTriggeredRef.current && !isLoadingOlder && scrollRef.current) {
      loadMoreTriggeredRef.current = false;
      const el = scrollRef.current;
      const heightDiff = el.scrollHeight - scrollHeightBeforeLoadRef.current;
      if (heightDiff > 0) {
        el.scrollTop = scrollTopBeforeLoadRef.current + heightDiff;
      }
    }
  }, [isLoadingOlder, messages.length]);

  const handleNavigateToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-amber-400/50', 'rounded-md');
      setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400/50', 'rounded-md'), 2000);
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden', className)}>
      {/* Pinned messages */}
      <MessagePinnedBar messages={pinnedMessages} onNavigateToMessage={handleNavigateToMessage} />

      {/* Messages feed */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 min-w-0 overscroll-contain"
        style={{ overflowAnchor: 'none' } as React.CSSProperties}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full py-20">
            <Spinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Aucun message"
            description="Lancez la discussion en envoyant un premier message."
            variant="full"
            className="h-full border-0 min-h-0"
          />
        ) : (
          <div className="py-2 min-w-0">
            {isLoadingOlder && (
              <div className="flex justify-center py-3">
                <Spinner size="sm" />
              </div>
            )}
            {buildFeedItems(messages, pinnedMessages, now).map((item, idx) =>
              item.type === 'date' ? (
                <MessageDateSeparator
                  key={`date-${item.date.toISOString().slice(0, 10)}-${idx}`}
                  date={item.date}
                  previousDayMessages={item.previousDayMessages}
                  previousDayPinned={item.previousDayPinned}
                  orgId={orgId}
                  onTogglePin={onTogglePin}
                  onNavigateToMessage={handleNavigateToMessage}
                  onSummarySaved={onSummarySaved}
                  canRegenerateSummary={canRegenerateSummary}
                  scrollContainerRef={scrollRef}
                />
              ) : (
                <MessageItem
                  key={item.message.id}
                  message={item.message}
                  previousMessage={messages[item.index - 1]}
                  nextMessage={messages[item.index + 1]}
                  seenBy={messageSeenByMap.get(item.message.id)}
                  isLastInFeed={item.index === messages.length - 1}
                  orgId={orgId}
                  currentUserId={currentUserId}
                  onTogglePin={onTogglePin}
                  onToggleReaction={onToggleReaction}
                  onToggleImportant={onToggleImportant}
                  onVotePoll={onVotePoll}
                  onVoteQuick={onVoteQuick}
                  onEditPoll={onEditPoll}
                  onDelete={onDelete}
                  canDeleteSystemMessage={canDeleteSystemMessages}
                  canEditPoll={canEditPoll}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="pb-3 sm:pb-0">
        <MessageComposer
          onSend={onSend}
          onSendImage={onSendImage}
          onSendDriveFile={onSendDriveFile}
          onSendEntity={onSendEntity}
          onSendPoll={onSendPoll}
          onSendQuickVote={onSendQuickVote}
          orgId={orgId}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
