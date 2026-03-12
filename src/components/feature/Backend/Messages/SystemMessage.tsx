'use client';

import { Pin, MoreVertical, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar } from '@/components/ui/atoms';
import { MenuPicker } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';
import { BusinessCard } from './BusinessCard';
import { getEntityConfig } from '@/lib/messages-entity-config';
import type { Message } from '@/types/messages';

export type SystemMessageVariant = 'compact' | 'full';

interface SystemMessageProps {
  message: Message;
  isFirst?: boolean;
  isLast?: boolean;
  isLastOfDay?: boolean;
  onDelete?: (messageId: string) => void;
  canDelete?: boolean;
  className?: string;
}

export function SystemMessage({
  message,
  isFirst = true,
  isLast = true,
  isLastOfDay = false,
  onDelete,
  canDelete = false,
  className,
}: SystemMessageProps) {
  const config = getEntityConfig(message.relatedEntityType ?? null);
  const Icon = config.icon;
  const isPinned = message.isPinned;
  const hasEntity = !!message.relatedEntityType;
  const useCompact = !hasEntity && (message.metadata?.compact !== false);

  const systemInitials = message.author?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2) ?? 'S';

  const showDelete = canDelete && onDelete;

  const deleteMenu = showDelete && (
    <MenuPicker
      align="end"
      side="bottom"
      header="Message système"
      trigger={
        <button
          type="button"
          className={cn(
            'p-1 rounded-md shrink-0 transition-colors',
            'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300',
            'hover:bg-zinc-100 dark:hover:bg-zinc-800',
            'opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100'
          )}
          aria-label="Actions du message"
        >
          <MoreVertical size={16} />
        </button>
      }
      items={[
        {
          id: 'delete',
          label: 'Supprimer',
          icon: Trash2,
          onClick: () => onDelete(message.id),
          variant: 'destructive' as const,
        },
      ]}
    />
  );

  if (useCompact) {
    return (
      <div
        id={`msg-${message.id}`}
        className={cn(
          'relative group w-full px-2 sm:px-4',
          isLastOfDay && 'mb-6',
          isFirst ? 'pt-3' : 'pt-px',
          className
        )}
      >
        <div className="flex items-center gap-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 w-full py-2">
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700 min-w-0" />
              <div className="flex flex-col items-center gap-0.5 shrink-0 max-w-[280px]">
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 text-center line-clamp-2 leading-relaxed">
                  {message.content}
                </p>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {config.label} · {format(new Date(message.createdAt), "d MMM 'à' HH:mm", { locale: fr })}
                </span>
              </div>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700 min-w-0" />
            </div>
          </div>
          {deleteMenu}
        </div>
      </div>
    );
  }

  return (
    <div
      id={`msg-${message.id}`}
      className={cn(
        'relative group px-2 sm:px-4',
        isLastOfDay && 'mb-6',
        isFirst ? 'pt-3' : 'pt-px',
        className
      )}
    >
      <div className="flex items-end gap-2">
        {isLast ? (
          message.author?.avatar || message.author?.name ? (
            <Avatar
              src={message.author?.avatar}
              alt={message.author?.name}
              fallback={systemInitials}
              size="sm"
              className="shrink-0 mb-0.5"
            />
          ) : (
            <div className={cn('flex items-center justify-center w-8 h-8 rounded-full shrink-0 mb-0.5', config.avatarBg)}>
              <Icon size={16} className={config.iconColor} />
            </div>
          )
        ) : (
          <div className="w-8 shrink-0" />
        )}
        <div className="flex-1 min-w-0 flex items-center gap-1">
          <div
            className={cn(
              'flex items-start gap-2.5 px-0 py-0',
              isPinned && 'flex-row-reverse justify-end'
            )}
          >
            <div className={cn('min-w-0', !isPinned && 'flex-1')}>
              <div className={cn(
                'flex items-baseline gap-1.5 mb-1',
                isPinned ? 'justify-end pr-0.5' : 'pl-0.5'
              )}>
                <span className={cn('text-[11px] font-medium', config.iconColor)}>
                  {config.label}
                </span>
                <span className="text-[10px] text-zinc-300 dark:text-zinc-600">
                  {format(new Date(message.createdAt), "d MMM 'à' HH:mm", { locale: fr })}
                </span>
                {isPinned && <Pin size={9} className="text-amber-500" />}
              </div>

              <div
                className={cn(
                  'w-full rounded-2xl',
                  isPinned ? 'rounded-br-md' : 'rounded-bl-md',
                  hasEntity ? 'block p-0 overflow-hidden' : 'block px-3.5 py-2.5',
                  isPinned && 'ml-auto',
                  'border bg-transparent',
                  config.borderColor
                )}
              >
                {hasEntity ? (
                  <BusinessCard
                    entityType={message.relatedEntityType!}
                    metadata={message.metadata ?? {}}
                    embedded
                    className="rounded-2xl rounded-bl-md w-full"
                  />
                ) : (
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {message.content}
                  </p>
                )}
              </div>
            </div>
          </div>
          {deleteMenu}
        </div>
      </div>
    </div>
  );
}
