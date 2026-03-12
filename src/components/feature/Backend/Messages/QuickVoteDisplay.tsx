'use client';

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickVoteDisplayProps {
  question?: string;
  yes: string[];
  no: string[];
  currentUserId: string | null;
  onVote?: (vote: 'yes' | 'no') => void;
  bubbleRadius?: string;
  className?: string;
}

export function QuickVoteDisplay({
  question,
  yes,
  no,
  currentUserId,
  onVote,
  bubbleRadius = 'rounded-2xl rounded-bl-md',
  className,
}: QuickVoteDisplayProps) {
  const total = yes.length + no.length;
  const hasVotedYes = currentUserId ? yes.includes(currentUserId) : false;
  const hasVotedNo = currentUserId ? no.includes(currentUserId) : false;

  return (
    <div
      className={cn(
        'flex-1 min-w-0 max-w-[85%] border overflow-hidden',
        'border-zinc-200 dark:border-zinc-700',
        'bg-zinc-50/50 dark:bg-zinc-900/30',
        bubbleRadius,
        className
      )}
    >
      <div className="p-3.5">
        {question && (
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-3">
            {question}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onVote?.('yes')}
            disabled={!onVote}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              'border',
              hasVotedYes
                ? 'bg-emerald-100 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20',
              !onVote && 'cursor-default'
            )}
          >
            <ThumbsUp size={16} />
            <span>Oui</span>
            <span className="text-xs opacity-70">{yes.length}</span>
          </button>

          <button
            type="button"
            onClick={() => onVote?.('no')}
            disabled={!onVote}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              'border',
              hasVotedNo
                ? 'bg-red-100 dark:bg-red-950/40 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 ring-2 ring-red-500/30'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/20',
              !onVote && 'cursor-default'
            )}
          >
            <ThumbsDown size={16} />
            <span>Non</span>
            <span className="text-xs opacity-70">{no.length}</span>
          </button>
        </div>

        {total > 0 && (
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {total} vote{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
