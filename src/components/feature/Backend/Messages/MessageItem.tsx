'use client';

import { Pin, PinOff, MoreVertical, Copy, Trash2, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MenuPicker } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';
import { MessageEntityCard } from './MessageEntityCard';
import { MessageAttachment, PollDisplay, QuickVoteDisplay, LinkPreview } from './MessageContent';
import { MessageReactions, MessageReactionAddButton } from './MessageReactions';
import {
  MessageWrapper,
  MessageAvatarSlot,
  MessageHeader,
  HorizontalSeparator,
  MENU_TRIGGER_CLASSES,
  getBubbleRadius,
  getCardBubbleRadius,
} from './MessageParts';
import { getEntityConfig } from '@/lib/messages-entity-config';
import type { Message } from '@/types/messages';

// ── Helpers ──────────────────────────────────────────────────────────────────

function isSameGroup(a: Message | undefined, b: Message): boolean {
  if (!a) return false;
  if (a.type !== b.type) return false;
  return a.authorId === b.authorId || (a.authorId == null && b.authorId == null);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type MessageVariant =
  | 'user'
  | 'user-poll'
  | 'user-vote'
  | 'user-entity'
  | 'system-compact'
  | 'system-entity';

function getVariant(message: Message): MessageVariant {
  if (message.type === 'system') {
    if (!message.relatedEntityType && (message.metadata?.compact as boolean | undefined) !== false) {
      return 'system-compact';
    }
    if (message.relatedEntityType) return 'system-entity';
  }
  if (message.metadata?.poll) return 'user-poll';
  if (message.metadata?.quickVote) return 'user-vote';
  if (message.metadata?.cardOnly && message.relatedEntityType) return 'user-entity';
  return 'user';
}

// ── Props ────────────────────────────────────────────────────────────────────

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

// ── Component ────────────────────────────────────────────────────────────────

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
  const variant = getVariant(message);
  const isFirst = !isSameGroup(previousMessage, message);
  const isLast = !isSameGroup(nextMessage, message);

  const msgDate = new Date(message.createdAt);
  const nextMsgDate = nextMessage ? new Date(nextMessage.createdAt) : null;
  const isLastOfDay = !nextMessage || !nextMsgDate || !isSameDay(msgDate, nextMsgDate);

  // ── System compact variant ─────────────────────────────────────────────────

  if (variant === 'system-compact') {
    const config = getEntityConfig(message.relatedEntityType ?? null);
    const showDelete = canDeleteSystemMessage && onDelete;

    return (
      <MessageWrapper
        messageId={message.id}
        isFirst={isFirst}
        isLastOfDay={isLastOfDay}
        wide
        className={className}
      >
        <div className="flex items-center gap-1">
          <div className="flex-1 min-w-0">
            <HorizontalSeparator>
              <div className="flex flex-col items-center gap-0.5 shrink-0 max-w-[280px]">
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 text-center line-clamp-2 leading-relaxed">
                  {message.content}
                </p>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {config.label} · {format(msgDate, "d MMM 'à' HH:mm", { locale: fr })}
                </span>
              </div>
            </HorizontalSeparator>
          </div>
          {showDelete && (
            <MenuPicker
              align="end"
              side="bottom"
              header="Message système"
              trigger={
                <button
                  type="button"
                  className={MENU_TRIGGER_CLASSES}
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
          )}
        </div>
      </MessageWrapper>
    );
  }

  // ── Shared data for all other variants ─────────────────────────────────────

  const initials = message.author?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2) ?? '';

  const isOwnMessage = message.type === 'user' && !!currentUserId && message.authorId === currentUserId;
  const isPinned = message.isPinned;
  const isImportant = !!(message.metadata?.isImportant as boolean | undefined);
  const isCardOnly = !!(message.metadata?.cardOnly as boolean | undefined);
  const mentionedUserIds = message.metadata?.mentionedUserIds as string[] | undefined;
  const isMentioned = !!(currentUserId && mentionedUserIds?.includes(currentUserId));

  // États de surbrillance (ordre d'affichage : mentionné > important > épinglé)
  const highlightStates = [
    isMentioned && ('mentioned' as const),
    isImportant && ('important' as const),
    isPinned && ('pinned' as const),
  ].filter(Boolean) as Array<'mentioned' | 'important' | 'pinned'>;

  const nextHasHighlight =
    nextMessage &&
    (!!nextMessage.isPinned ||
      !!(nextMessage.metadata?.isImportant as boolean) ||
      !!(currentUserId && (nextMessage.metadata?.mentionedUserIds as string[] | undefined)?.includes(currentUserId)));
  const compactBelow = !!nextMessage && isSameGroup(message, nextMessage) && !!nextHasHighlight;

  const isEntityCard = isCardOnly || (message.type === 'system' && !!message.relatedEntityType);
  const entityConf = isEntityCard && message.relatedEntityType
    ? getEntityConfig(message.relatedEntityType)
    : null;
  const EntityIcon = entityConf?.icon;

  const pollData = message.metadata?.poll as { question: string; options: { id: string; label: string }[]; votes?: Record<string, string> } | undefined;
  const isPoll = !!pollData;
  const quickVoteData = message.metadata?.quickVote as { question?: string; yes: string[]; no: string[] } | undefined;
  const isQuickVote = !!quickVoteData;

  const bubbleRadius = getBubbleRadius(isFirst, isLast, isOwnMessage);
  const cardBubbleRadius = getCardBubbleRadius(isOwnMessage);

  const headerLabel = entityConf ? entityConf.label : (message.author?.name ?? 'Utilisateur');
  const headerLabelColor = entityConf ? entityConf.iconColor : undefined;

  // @mentions rendering
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
        ? <span key={i} className={isOwnMessage ? 'text-white/90 underline decoration-white/60 cursor-default font-medium' : 'text-blue-500 dark:text-blue-400 underline decoration-blue-400/60 cursor-default font-medium'}>{part.text}</span>
        : part.text,
    );
  };

  // ── Full message layout ────────────────────────────────────────────────────

  return (
    <MessageWrapper
      messageId={message.id}
      isFirst={isFirst}
      isLastOfDay={isLastOfDay}
      highlightStates={highlightStates}
      compactBelow={compactBelow}
      className={className}
    >
      <div className={cn('flex items-end gap-2', isOwnMessage && 'flex-row-reverse justify-end')}>
        <div className={cn(isOwnMessage && 'hidden sm:block')}>
          <MessageAvatarSlot
            show={isLast}
            avatarSrc={message.author?.avatar}
            avatarAlt={message.author?.name}
            fallback={initials}
            entityIcon={
              message.type === 'system' && entityConf && EntityIcon && !message.author?.avatar && !message.author?.name
                ? EntityIcon
                : undefined
            }
            entityAvatarBg={entityConf?.avatarBg}
            entityIconColor={entityConf?.iconColor}
          />
        </div>

        <div className={cn('min-w-0 flex-1', isOwnMessage && 'flex flex-col items-end')}>
          {isFirst && (
            <MessageHeader
              label={headerLabel}
              labelColor={headerLabelColor}
              highlightStates={highlightStates}
              alignEnd={isOwnMessage}
            />
          )}

          {/* Link previews */}
          {!isPoll && !isQuickVote && !isEntityCard && (message.metadata?.linkPreviews as Array<{ url: string; title?: string; description?: string; image?: string; siteName?: string }>)?.length > 0 && (
            <div className={cn('mb-1 space-y-1.5 min-w-0 w-full max-w-full sm:max-w-[85%]', isOwnMessage ? 'self-end' : 'w-full')}>
              {(message.metadata.linkPreviews as Array<{ url: string; title?: string; description?: string; image?: string; siteName?: string }>).map((p, i) => (
                <LinkPreview key={`${p.url}-${i}`} preview={p} />
              ))}
            </div>
          )}

          {/* Bubble + reaction + menu row */}
          <div className={cn('flex items-center gap-1', isOwnMessage && 'flex-row-reverse w-fit max-w-full')}>
            {isPoll && pollData ? (
              <PollDisplay
                question={pollData.question}
                options={pollData.options}
                votes={pollData.votes ?? {}}
                currentUserId={currentUserId ?? null}
                onVote={onVotePoll ? (optId) => onVotePoll(message.id, optId) : undefined}
                bubbleRadius={cardBubbleRadius}
                className={isOwnMessage ? 'bg-[#495ef3] border-[#495ef3]/80 [&_p]:text-white [&_span]:text-white/90 [&_.text-zinc-500]:text-white/80' : ''}
              />
            ) : isQuickVote && quickVoteData ? (
              <QuickVoteDisplay
                question={quickVoteData.question}
                yes={quickVoteData.yes ?? []}
                no={quickVoteData.no ?? []}
                currentUserId={currentUserId ?? null}
                onVote={onVoteQuick ? (vote) => onVoteQuick(message.id, vote) : undefined}
                bubbleRadius={cardBubbleRadius}
                className={isOwnMessage ? 'bg-[#495ef3] border-[#495ef3]/80 [&_p]:text-white [&_span]:text-white/90 [&_.text-zinc-500]:text-white/80' : ''}
              />
            ) : isEntityCard && message.relatedEntityType && entityConf ? (
              <div className={cn(
                'inline-block min-w-0 sm:min-w-[385px] w-full max-w-full sm:max-w-[85%] border overflow-hidden',
                cardBubbleRadius,
                entityConf.borderColor,
              )}>
                <MessageEntityCard
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
                  isOwnMessage && 'w-max max-w-[85%] shrink-0',
                  isOwnMessage ? 'bg-[#495ef3] text-white' : 'bg-surface-elevated text-zinc-800 dark:text-zinc-200',
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
              header={format(msgDate, "EEEE d MMMM 'à' HH:mm", { locale: fr })}
              trigger={
                <button
                  type="button"
                  className={MENU_TRIGGER_CLASSES}
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

          {/* MessageEntityCard below text for messages with entity + text content */}
          {message.relatedEntityType && !isEntityCard && (
            <div className={cn('inline-block min-w-[300px] sm:min-w-[385px] max-w-[300px] sm:max-w-[85%]', isOwnMessage && 'ml-auto')}>
              <MessageEntityCard entityType={message.relatedEntityType} metadata={message.metadata} />
            </div>
          )}
        </div>
      </div>
    </MessageWrapper>
  );
}
