'use client';

import { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import { MESSAGE_HIGHLIGHT_CONFIG } from './MessageParts';
import type { MessageReaction } from '@/types/messages';
import type { MessageHighlightState } from './MessageParts';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface MessageReactionAddButtonProps {
  messageId: string;
  onToggleReaction: (messageId: string, emoji: string) => void;
  className?: string;
}

export function MessageReactionAddButton({
  messageId,
  onToggleReaction,
  className,
}: MessageReactionAddButtonProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'p-1 rounded-md shrink-0 transition-colors',
            'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300',
            'hover:bg-zinc-100 dark:hover:bg-zinc-800',
            'opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100',
            className
          )}
          aria-label="Ajouter une réaction"
        >
          <SmilePlus size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-auto p-1">
        <div className="flex gap-0.5">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onToggleReaction(messageId, emoji);
                setPickerOpen(false);
              }}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface MessageReactionPillsProps {
  messageId: string;
  reactions: MessageReaction[];
  onToggleReaction: (messageId: string, emoji: string) => void;
  highlightStates?: MessageHighlightState[];
  className?: string;
}

export function MessageReactionPills({
  messageId,
  reactions,
  onToggleReaction,
  highlightStates = [],
  className,
}: MessageReactionPillsProps) {
  if (reactions.length === 0) return null;

  const reactionBorderColor =
    highlightStates.length > 0
      ? MESSAGE_HIGHLIGHT_CONFIG[highlightStates[0]].reactionBorderColor
      : '#171717';

  return (
    <div className={cn('flex items-center gap-0.5 -mt-1 flex-wrap', className)}>
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => onToggleReaction(messageId, r.emoji)}
          style={{ border: `3px solid ${reactionBorderColor}` }}
          className={cn(
            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-xs transition-colors',
            r.hasCurrentUser
              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          )}
        >
          <span>{r.emoji}</span>
          {r.userIds.length > 1 && (
            <span className="text-[10px] opacity-80">{r.userIds.length}</span>
          )}
        </button>
      ))}
    </div>
  );
}

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  onToggleReaction: (messageId: string, emoji: string) => void;
  highlightStates?: MessageHighlightState[];
  className?: string;
}

export function MessageReactions({
  messageId,
  reactions,
  onToggleReaction,
  highlightStates = [],
  className,
}: MessageReactionsProps) {
  return (
    <MessageReactionPills
      messageId={messageId}
      reactions={reactions}
      onToggleReaction={onToggleReaction}
      highlightStates={highlightStates}
      className={className}
    />
  );
}
