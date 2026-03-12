'use client';

import { Pin, PinOff, MoreVertical, Copy, Trash2, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar } from '@/components/ui/atoms';
import { MenuPicker } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';
import { SystemMessage } from './SystemMessage';
import { BusinessCard } from './BusinessCard';
import { MessageAttachment } from './MessageAttachment';
import { MessageReactions, MessageReactionAddButton } from './MessageReactions';
import { PollDisplay } from './PollDisplay';
import { QuickVoteDisplay } from './QuickVoteDisplay';
import { LinkPreview } from './LinkPreview';
import { getEntityConfig } from '@/lib/messages-entity-config';
import type { Message } from '@/types/messages';

function isSameGroup(a: Message | undefined, b: Message): boolean {
  if (!a) return false;
  if (a.type !== b.type) return false;
  return a.authorId === b.authorId || (a.authorId == null && b.authorId == null);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface MessageItemProps {
  message: Message;
  previousMessage?: Message;
  nextMessage?: Message;
  orgId?: string | null;
  currentUserId?: string | null;
  onTogglePin: (messageId: string, pinned: boolean) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
  onToggleImportant?: (messageId: string) => void;
  onVotePoll?: (messageId: string, optionId: string) => void;
  onVoteQuick?: (messageId: string, vote: 'yes' | 'no') => void;
  onDelete?: (messageId: string) => void;
  canDeleteSystemMessage?: boolean;
  className?: string;
}

export function MessageItem({
  message,
  previousMessage,
  nextMessage,
  orgId,
  currentUserId,
  onTogglePin,
  onToggleReaction,
  onToggleImportant,
  onVotePoll,
  onVoteQuick,
  onDelete,
  canDeleteSystemMessage,
  className,
}: MessageItemProps) {
  const isFirst = !isSameGroup(previousMessage, message);
  const isLast = !isSameGroup(nextMessage, message);

  if (message.type === 'system' && !message.relatedEntityType) {
    const msgDate = new Date(message.createdAt);
    const nextMsgDate = nextMessage ? new Date(nextMessage.createdAt) : null;
    const isLastOfDaySys = !nextMessage || !nextMsgDate || !isSameDay(msgDate, nextMsgDate);
    return (
      <SystemMessage
        message={message}
        isFirst={isFirst}
        isLast={isLast}
        isLastOfDay={isLastOfDaySys}
        onDelete={onDelete}
        canDelete={canDeleteSystemMessage}
        className={className}
      />
    );
  }

  const msgDate = new Date(message.createdAt);
  const nextMsgDate = nextMessage ? new Date(nextMessage.createdAt) : null;
  const isLastOfDay = !nextMessage || !nextMsgDate || !isSameDay(msgDate, nextMsgDate);

  const initials = message.author?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2) ?? '';

  const isPinned = message.isPinned;
  const isImportant = !!(message.metadata?.isImportant as boolean | undefined);
  const isCardOnly = !!(message.metadata?.cardOnly as boolean | undefined);
  const pollData = message.metadata?.poll as { question: string; options: { id: string; label: string }[]; votes?: Record<string, string> } | undefined;
  const isPoll = !!pollData;
  const quickVoteData = message.metadata?.quickVote as { question?: string; yes: string[]; no: string[] } | undefined;
  const isQuickVote = !!quickVoteData;
  const mentionedUserIds = message.metadata?.mentionedUserIds as string[] | undefined;
  const isMentioned = !!(currentUserId && mentionedUserIds?.includes(currentUserId));

  const bubbleRadius = cn(
    'rounded-2xl',
    isPinned
      ? cn(
          isFirst && isLast && 'rounded-br-md',
          isFirst && !isLast && 'rounded-br-sm rounded-br-[4px]',
          !isFirst && !isLast && 'rounded-r-[4px]',
          !isFirst && isLast && 'rounded-tr-[4px] rounded-br-md',
        )
      : cn(
          isFirst && isLast && 'rounded-bl-md',
          isFirst && !isLast && 'rounded-bl-sm rounded-bl-[4px]',
          !isFirst && !isLast && 'rounded-l-[4px]',
          !isFirst && isLast && 'rounded-tl-[4px] rounded-bl-md',
        ),
  );

  // Config d'entité : user cardOnly OU message système avec entité — même bulle
  const isEntityCard = isCardOnly || (message.type === 'system' && !!message.relatedEntityType);
  const entityConf = isEntityCard && message.relatedEntityType
    ? getEntityConfig(message.relatedEntityType)
    : null;
  const EntityIcon = entityConf?.icon;

  // Rendu du texte avec @mentions stylisés en bleu souligné
  const mentionedNames = message.metadata?.mentionedNames as string[] | undefined;
  const renderWithMentions = (text: string): React.ReactNode => {
    if (!mentionedNames?.length) return text;
    const sorted = [...mentionedNames].sort((a, b) => b.length - a.length);
    type Part = { text: string; isMention: boolean };
    let parts: Part[] = [{ text, isMention: false }];
    for (const name of sorted) {
      const token = `@${name}`;
      const next: Part[] = [];
      for (const part of parts) {
        if (part.isMention) { next.push(part); continue; }
        const segments = part.text.split(token);
        segments.forEach((seg, i) => {
          if (seg) next.push({ text: seg, isMention: false });
          if (i < segments.length - 1) next.push({ text: token, isMention: true });
        });
      }
      parts = next;
    }
    return parts.map((part, i) =>
      part.isMention
        ? <span key={i} className="text-blue-500 dark:text-blue-400 underline decoration-blue-400/60 cursor-default font-medium">{part.text}</span>
        : part.text
    );
  };

  // Rayon de bulle pour la card système
  const cardBubbleRadius = cn(
    'rounded-2xl',
    isPinned ? 'rounded-br-md' : 'rounded-bl-md'
  );

  return (
    <div
      id={`msg-${message.id}`}
      className={cn(
        'relative group px-2 sm:px-4',
        isLastOfDay && 'mb-6',
        isFirst ? 'pt-3' : 'pt-px',
        isPinned && 'bg-amber-50/40 dark:bg-amber-950/10',
        isImportant && 'bg-orange-50/30 dark:bg-orange-950/10',
        isMentioned && 'bg-blue-50/40 dark:bg-blue-950/10',
        className
      )}
    >
      {/* Barre verticale gauche pour les mentions */}
      {isMentioned && (
        <div className="absolute left-0 inset-y-0 w-0.5 bg-blue-400 dark:bg-blue-500 rounded-r" />
      )}
      <div className={cn(
        'flex items-end gap-2',
        isPinned && 'flex-row-reverse justify-end'
      )}>
        {/* Avatar only on last message of group */}
        {isLast ? (
          message.type === 'system' && entityConf && EntityIcon && !message.author?.avatar && !message.author?.name ? (
            <div className={cn('flex items-center justify-center w-8 h-8 rounded-full shrink-0 mb-0.5', entityConf.avatarBg)}>
              <EntityIcon size={16} className={entityConf.iconColor} />
            </div>
          ) : (
            <Avatar
              src={message.author?.avatar}
              alt={message.author?.name}
              fallback={initials}
              size="sm"
              className="shrink-0 mb-0.5"
            />
          )
        ) : (
          <div className="w-8 shrink-0" />
        )}

        <div className={cn('min-w-0', !isPinned && 'flex-1', isPinned && 'flex flex-col items-end')}>
          {/* Name + time + badges — only on first message of group */}
          {isFirst && (
            <div className={cn(
              'flex items-center gap-1.5 mb-1 flex-wrap',
              isPinned ? 'justify-end pr-1' : 'pl-1'
            )}>
              <span className={cn(
                'text-[11px] font-medium',
                entityConf ? entityConf.iconColor : 'text-zinc-400 dark:text-zinc-500'
              )}>
                {entityConf ? entityConf.label : (message.author?.name ?? 'Utilisateur')}
              </span>
              {message.isPinned && (
                <Pin size={9} className="text-amber-500" />
              )}
              {isImportant && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                  <Zap size={9} />
                  Important
                </span>
              )}
              {isMentioned && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  @ vous
                </span>
              )}
            </div>
          )}

          {/* Link previews en premier, puis message en dessous */}
          {!isPoll && !isQuickVote && !isEntityCard && (message.metadata?.linkPreviews as Array<{ url: string; title?: string; description?: string; image?: string; siteName?: string }>)?.length > 0 && (
            <div className={cn('mb-2 space-y-2 w-full max-w-[85%] min-w-0', isPinned && 'ml-auto')}>
              {(message.metadata.linkPreviews as Array<{ url: string; title?: string; description?: string; image?: string; siteName?: string }>).map((p, i) => (
                <LinkPreview key={`${p.url}-${i}`} preview={p} />
              ))}
            </div>
          )}

          {/* Bubble + réaction + menu row */}
          <div className={cn(
            'flex items-center gap-1',
            isPinned && 'flex-row-reverse'
          )}>
            {/* Slot bulle */}
            {isPoll && pollData ? (
              <PollDisplay
                question={pollData.question}
                options={pollData.options}
                votes={pollData.votes ?? {}}
                currentUserId={currentUserId ?? null}
                onVote={onVotePoll ? (optId) => onVotePoll(message.id, optId) : undefined}
                bubbleRadius={cardBubbleRadius}
                className={isPinned ? 'ml-auto' : ''}
              />
            ) : isQuickVote && quickVoteData ? (
              <QuickVoteDisplay
                question={quickVoteData.question}
                yes={quickVoteData.yes ?? []}
                no={quickVoteData.no ?? []}
                currentUserId={currentUserId ?? null}
                onVote={onVoteQuick ? (vote) => onVoteQuick(message.id, vote) : undefined}
                bubbleRadius={cardBubbleRadius}
                className={isPinned ? 'ml-auto' : ''}
              />
            ) : isEntityCard && message.relatedEntityType && entityConf ? (
              // Card stylée comme une bulle système (border colorée, embedded) — pleine largeur
              <div className={cn(
                'flex-1 min-w-0 w-full border overflow-hidden block',
                cardBubbleRadius,
                entityConf.borderColor,
                isPinned && 'ml-auto',
              )}>
                <BusinessCard
                  entityType={message.relatedEntityType}
                  metadata={message.metadata ?? {}}
                  embedded
                  className={cardBubbleRadius}
                />
              </div>
            ) : !isEntityCard ? (
              (message.metadata?.attachmentType as string) ? (
                <MessageAttachment message={message} orgId={orgId ?? null} />
              ) : (
                <div className={cn(
                  'inline-block max-w-[85%] min-w-0 px-2.5 sm:px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap',
                  'bg-surface-elevated text-zinc-800 dark:text-zinc-200',
                  bubbleRadius,
                )}>
                  {renderWithMentions(message.content)}
                </div>
              )
            ) : null}

            {onToggleReaction && (
              <MessageReactionAddButton
                messageId={message.id}
                onToggleReaction={onToggleReaction}
              />
            )}

            <MenuPicker
              align="end"
              side="bottom"
              header={format(new Date(message.createdAt), "EEEE d MMMM 'à' HH:mm", { locale: fr })}
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
                  id: 'pin',
                  label: message.isPinned ? 'Désépingler' : 'Épingler',
                  icon: message.isPinned ? PinOff : Pin,
                  onClick: () => onTogglePin(message.id, !message.isPinned),
                },
                ...(onToggleImportant
                  ? [{
                      id: 'important',
                      label: isImportant ? 'Retirer l\'importance' : 'Marquer comme important',
                      icon: Zap,
                      onClick: () => onToggleImportant(message.id),
                    }]
                  : []),
                {
                  id: 'copy',
                  label: 'Copier le message',
                  icon: Copy,
                  onClick: () => navigator.clipboard?.writeText(message.content),
                },
                ...(onDelete && (message.type !== 'system' || canDeleteSystemMessage)
                  ? [{
                      id: 'delete',
                      label: 'Supprimer',
                      icon: Trash2,
                      onClick: () => onDelete(message.id),
                      variant: 'destructive' as const,
                    }]
                  : []),
              ]}
            />
          </div>

          {onToggleReaction && (
            <MessageReactions
              messageId={message.id}
              reactions={message.reactions ?? []}
              onToggleReaction={onToggleReaction}
            />
          )}

          {/* BusinessCard en bas uniquement pour les messages texte + entité (pas cardOnly) */}
          {message.relatedEntityType && !isEntityCard && (
            <div className={cn('w-full min-w-0', isPinned && 'ml-auto')}>
              <BusinessCard entityType={message.relatedEntityType} metadata={message.metadata} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
