'use client';

import { Pin } from 'lucide-react';
import { Chip } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/messages';

const PREVIEW_LENGTH = 70;

function getMessagePreview(msg: Message): string {
  const content = msg.content?.trim() ?? '';
  const preview = content.length <= PREVIEW_LENGTH ? content : content.slice(0, PREVIEW_LENGTH).trim() + '…';
  return preview || 'Message épinglé';
}

interface MessagePinnedBarProps {
  messages: Message[];
  onNavigateToMessage?: (messageId: string) => void;
  className?: string;
}

export function MessagePinnedBar({ messages, onNavigateToMessage, className }: MessagePinnedBarProps) {
  if (messages.length === 0) return null;

  return (
    <div className={cn('border-b border-border-custom bg-amber-50/30 dark:bg-amber-950/20', className)}>
      <div className="flex items-center gap-2 px-2 sm:px-4 py-2 overflow-x-auto">
        <Pin size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="flex items-center gap-2 shrink-0">
          {messages.map((msg) => (
            <Chip
              key={msg.id}
              label={getMessagePreview(msg)}
              variant="warning"
              className={cn(
                'shrink-0',
                onNavigateToMessage ? 'cursor-pointer hover:opacity-90 transition-opacity' : 'cursor-default',
              )}
              onClick={onNavigateToMessage ? () => onNavigateToMessage(msg.id) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use MessagePinnedBar instead */
export const PinnedMessages = MessagePinnedBar;
