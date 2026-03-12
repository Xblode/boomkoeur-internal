'use client';

import { useRef, useEffect, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/ui/molecules';
import { Spinner } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import { MessageItem } from './MessageItem';
import { PinnedMessages } from './PinnedMessages';
import { MessageComposer } from './MessageComposer';
import { DateSeparator } from './DateSeparator';
import type { Message } from '@/types/messages';
import type { PickedEntity } from './EntityPickerModal';
import type { PollData } from './PollModal';

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildFeedItems(
  messages: Message[],
  pinnedMessages: Message[]
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

  return items;
}

interface MessageFeedProps {
  messages: Message[];
  pinnedMessages: Message[];
  isLoading: boolean;
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
  onSendQuickVote?: (quickVote: { question?: string; yes: string[]; no: string[] }) => void;
  onDelete?: (messageId: string) => void;
  canDeleteSystemMessages?: boolean;
  onSummarySaved?: () => void;
  className?: string;
}

export function MessageFeed({
  messages,
  pinnedMessages,
  isLoading,
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
  onSendQuickVote,
  onDelete,
  canDeleteSystemMessages,
  onSummarySaved,
  className,
}: MessageFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevLengthRef = useRef(messages.length);
  const initialScrollDoneRef = useRef(false);

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
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 60;
  };

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
      <PinnedMessages messages={pinnedMessages} onNavigateToMessage={handleNavigateToMessage} />

      {/* Messages feed */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 min-w-0"
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
          <div className="py-2">
            {buildFeedItems(messages, pinnedMessages).map((item, idx) =>
              item.type === 'date' ? (
                <DateSeparator
                  key={`date-${item.date.toISOString().slice(0, 10)}-${idx}`}
                  date={item.date}
                  previousDayMessages={item.previousDayMessages}
                  previousDayPinned={item.previousDayPinned}
                  orgId={orgId}
                  onTogglePin={onTogglePin}
                  onNavigateToMessage={handleNavigateToMessage}
                  onSummarySaved={onSummarySaved}
                />
              ) : (
                <MessageItem
                  key={item.message.id}
                  message={item.message}
                  previousMessage={messages[item.index - 1]}
                  nextMessage={messages[item.index + 1]}
                  orgId={orgId}
                  currentUserId={currentUserId}
                  onTogglePin={onTogglePin}
                  onToggleReaction={onToggleReaction}
                  onToggleImportant={onToggleImportant}
                  onVotePoll={onVotePoll}
                  onVoteQuick={onVoteQuick}
                  onDelete={onDelete}
                  canDeleteSystemMessage={canDeleteSystemMessages}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Composer */}
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
  );
}
