'use client';

import { useState } from 'react';
import { SmilePlus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import type { MessageReaction } from '@/types/messages';

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
  className?: string;
}

export function MessageReactionPills({
  messageId,
  reactions,
  onToggleReaction,
  className,
}: MessageReactionPillsProps) {
  if (reactions.length === 0) return null;

  return (
    <div className={cn('flex items-center gap-0.5 -mt-3 mb-2 flex-wrap', className)}>
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => onToggleReaction(messageId, r.emoji)}
          className={cn(
            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs transition-colors',
            r.hasCurrentUser
              ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
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
  className?: string;
}

export function MessageReactions({
  messageId,
  reactions,
  onToggleReaction,
  className,
}: MessageReactionsProps) {
  return (
    <>
      <MessageReactionPills
        messageId={messageId}
        reactions={reactions}
        onToggleReaction={onToggleReaction}
        className={className}
      />
    </>
  );
}
