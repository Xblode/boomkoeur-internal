'use client';

import { Pin, Zap, AtSign } from 'lucide-react';
import { Avatar } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ── Message highlight states (générique, extensible) ──────────────────────────

export type MessageHighlightState = 'mentioned' | 'important' | 'pinned';

export const MESSAGE_HIGHLIGHT_CONFIG: Record<
  MessageHighlightState,
  {
    bg: string;
    borderColor: string;
    badge: { label: string; icon: LucideIcon; badgeClassName: string };
  }
> = {
  mentioned: {
    bg: 'bg-blue-50/40 dark:bg-blue-950/10',
    borderColor: 'bg-blue-400 dark:bg-blue-500',
    badge: {
      label: '@ vous',
      icon: AtSign,
      badgeClassName: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    },
  },
  important: {
    bg: 'bg-orange-50/30 dark:bg-orange-950/10',
    borderColor: 'bg-orange-400 dark:bg-orange-500',
    badge: {
      label: 'Important',
      icon: Zap,
      badgeClassName: 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    },
  },
  pinned: {
    bg: 'bg-amber-50/40 dark:bg-amber-950/10',
    borderColor: 'bg-amber-400 dark:bg-amber-500',
    badge: {
      label: 'Épinglé',
      icon: Pin,
      badgeClassName: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    },
  },
};

/** Retourne les styles (bg + border) pour le premier état actif, pour éviter les conflits de couleurs. */
export function getHighlightWrapperStyles(highlightStates: MessageHighlightState[]): { bg: string; borderColor: string } {
  if (highlightStates.length === 0) {
    return { bg: '', borderColor: '' };
  }
  const first = MESSAGE_HIGHLIGHT_CONFIG[highlightStates[0]];
  return { bg: first.bg, borderColor: first.borderColor };
}

// ── MessageWrapper ───────────────────────────────────────────────────────────

interface MessageWrapperProps {
  messageId: string;
  isFirst?: boolean;
  isLastOfDay?: boolean;
  /** États de surbrillance (mentionné, important, épinglé) — appliquent fond + bordure gauche + padding vertical */
  highlightStates?: MessageHighlightState[];
  /** Pas de padding bas si le message suivant est du même auteur et aussi surligné (groupe compact) */
  compactBelow?: boolean;
  wide?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function MessageWrapper({
  messageId,
  isFirst,
  isLastOfDay,
  highlightStates = [],
  compactBelow,
  wide,
  className,
  children,
}: MessageWrapperProps) {
  const hasHighlight = highlightStates.length > 0;
  const { bg, borderColor } = getHighlightWrapperStyles(highlightStates);

  const paddingClasses = hasHighlight
    ? isFirst
      ? compactBelow
        ? 'pt-3'
        : 'pt-3 pb-2'
      : compactBelow
        ? 'pt-px'
        : 'pt-px pb-2'
    : isFirst
      ? 'pt-3'
      : 'pt-px';

  return (
    <div
      id={`msg-${messageId}`}
      className={cn(
        'relative group px-2 sm:px-4',
        wide && 'w-full',
        isLastOfDay && 'mb-6',
        paddingClasses,
        hasHighlight && bg,
        className,
      )}
    >
      {hasHighlight && borderColor && (
        <div className={cn('absolute left-0 inset-y-0 w-0.5 rounded-r', borderColor)} />
      )}
      {children}
    </div>
  );
}

// ── MessageAvatarSlot ────────────────────────────────────────────────────────

interface MessageAvatarSlotProps {
  show: boolean;
  avatarSrc?: string | null;
  avatarAlt?: string | null;
  fallback?: string;
  entityIcon?: LucideIcon;
  entityAvatarBg?: string;
  entityIconColor?: string;
}

export function MessageAvatarSlot({
  show,
  avatarSrc,
  avatarAlt,
  fallback = '',
  entityIcon: EntityIcon,
  entityAvatarBg,
  entityIconColor,
}: MessageAvatarSlotProps) {
  if (!show) return <div className="w-8 shrink-0" />;

  if (EntityIcon && entityAvatarBg && entityIconColor && !avatarSrc && !avatarAlt) {
    return (
      <div className={cn('flex items-center justify-center w-8 h-8 rounded-full shrink-0 mb-0.5', entityAvatarBg)}>
        <EntityIcon size={16} className={entityIconColor} />
      </div>
    );
  }

  return (
    <Avatar
      src={avatarSrc ?? undefined}
      alt={avatarAlt ?? undefined}
      fallback={fallback}
      size="sm"
      className="shrink-0 mb-0.5"
    />
  );
}

// ── MessageHeader ────────────────────────────────────────────────────────────

interface MessageHeaderProps {
  label: string;
  labelColor?: string;
  /** États de surbrillance — affichent un badge à droite du nom pour chaque état */
  highlightStates?: MessageHighlightState[];
  alignEnd?: boolean;
}

export function MessageHeader({
  label,
  labelColor = 'text-zinc-400 dark:text-zinc-500',
  highlightStates = [],
  alignEnd,
}: MessageHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 mb-1 flex-wrap',
        alignEnd ? 'justify-end pr-1' : 'pl-1',
      )}
    >
      <span className={cn('text-[11px] font-medium', labelColor)}>
        {label}
      </span>
      {highlightStates.map((state) => {
        const { badge } = MESSAGE_HIGHLIGHT_CONFIG[state];
        const Icon = badge.icon;
        return (
          <span
            key={state}
            className={cn(
              'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
              badge.badgeClassName,
            )}
          >
            <Icon size={9} />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}

// ── Menu trigger classes ─────────────────────────────────────────────────────

export const MENU_TRIGGER_CLASSES = [
  'p-1 rounded-md shrink-0 transition-colors',
  'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300',
  'hover:bg-zinc-100 dark:hover:bg-zinc-800',
  'opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100',
].join(' ');

// ── Bubble radius helpers ────────────────────────────────────────────────────

export function getBubbleRadius(isFirst: boolean, isLast: boolean, isPinned: boolean) {
  return cn(
    'rounded-xl',
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
}

export function getCardBubbleRadius(isPinned: boolean) {
  return cn('rounded-xl', isPinned ? 'rounded-br-md' : 'rounded-bl-md');
}

// ── HorizontalSeparator ─────────────────────────────────────────────────────

interface HorizontalSeparatorProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalSeparator({ children, className }: HorizontalSeparatorProps) {
  return (
    <div className={cn('flex items-center gap-3 w-full py-2', className)}>
      <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700 min-w-0" />
      <div className="shrink-0">{children}</div>
      <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700 min-w-0" />
    </div>
  );
}
