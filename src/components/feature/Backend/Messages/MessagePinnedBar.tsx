'use client';

import { useState } from 'react';
import { Pin, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/messages';

interface MessagePinnedBarProps {
  messages: Message[];
  onNavigateToMessage?: (messageId: string) => void;
  className?: string;
}

export function MessagePinnedBar({ messages, onNavigateToMessage, className }: MessagePinnedBarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (messages.length === 0) return null;

  return (
    <div className={cn('border-b border-border-custom', className)}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-2 sm:px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <Pin size={13} className="text-zinc-500 shrink-0" />
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          {messages.length} message{messages.length > 1 ? 's' : ''} épinglé{messages.length > 1 ? 's' : ''}
        </span>
        {isExpanded ? (
          <ChevronUp size={14} className="text-zinc-400 ml-auto" />
        ) : (
          <ChevronDown size={14} className="text-zinc-400 ml-auto" />
        )}
      </button>

      {isExpanded && (
        <div className="px-2 sm:px-4 pb-2 space-y-1">
          {messages.slice(0, 5).map((msg) => (
            <button
              key={msg.id}
              type="button"
              onClick={() => onNavigateToMessage?.(msg.id)}
              className="w-full text-left flex items-start gap-2 px-2.5 py-1.5 rounded-md hover:bg-amber-100/50 dark:hover:bg-amber-950/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {msg.author?.name ?? 'Système'}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {format(new Date(msg.createdAt), 'd MMM', { locale: fr })}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {msg.content}
                </p>
              </div>
            </button>
          ))}
          {messages.length > 5 && (
            <p className="text-[10px] text-zinc-500 px-2.5 py-1">
              +{messages.length - 5} autre{messages.length - 5 > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** @deprecated Use MessagePinnedBar instead */
export const PinnedMessages = MessagePinnedBar;
