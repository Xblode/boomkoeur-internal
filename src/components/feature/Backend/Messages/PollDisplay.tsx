'use client';

import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PollOption {
  id: string;
  label: string;
}

interface PollDisplayProps {
  question: string;
  options: PollOption[];
  votes: Record<string, string>;
  currentUserId: string | null;
  onVote?: (optionId: string) => void;
  bubbleRadius?: string;
  className?: string;
}

export function PollDisplay({
  question,
  options,
  votes,
  currentUserId,
  onVote,
  bubbleRadius = 'rounded-2xl rounded-bl-md',
  className,
}: PollDisplayProps) {
  const totalVotes = Object.keys(votes).length;
  const voteCounts = options.map((opt) => ({
    ...opt,
    count: Object.values(votes).filter((v) => v === opt.id).length,
  }));
  const maxCount = Math.max(...voteCounts.map((o) => o.count), 1);

  return (
    <div
      className={cn(
        'flex-1 min-w-0 border overflow-hidden',
        'border-zinc-200 dark:border-zinc-700',
        'bg-zinc-50/50 dark:bg-zinc-900/30',
        bubbleRadius,
        className
      )}
    >
      <div className="p-3.5">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-zinc-500 dark:text-zinc-400 shrink-0" />
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {question}
          </p>
        </div>

        <div className="space-y-2">
          {voteCounts.map((opt) => {
            const pct = maxCount > 0 ? (opt.count / maxCount) * 100 : 0;
            const isSelected = currentUserId ? votes[currentUserId] === opt.id : false;

            return (
              <div key={opt.id} className="relative">
                <button
                  type="button"
                  onClick={() => onVote?.(opt.id)}
                  disabled={!onVote}
                  className={cn(
                    'relative w-full text-left px-3 py-2 rounded-lg text-sm transition-colors overflow-hidden',
                    'border border-zinc-200 dark:border-zinc-700',
                    onVote && 'hover:border-zinc-300 dark:hover:border-zinc-600 cursor-pointer',
                    !onVote && 'cursor-default',
                    isSelected && 'ring-2 ring-blue-500/50 border-blue-400 dark:border-blue-500'
                  )}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 rounded-l-lg bg-blue-500/10 dark:bg-blue-500/5 transition-all pointer-events-none"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative flex items-center justify-between gap-2">
                    <span className="text-zinc-800 dark:text-zinc-200 truncate">
                      {opt.label}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                      {opt.count} vote{opt.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {totalVotes > 0 && (
          <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            {totalVotes} participant{totalVotes !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
