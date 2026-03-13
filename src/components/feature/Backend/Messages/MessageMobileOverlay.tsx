'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export interface MobileOverlayAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'destructive';
}

interface MessageMobileOverlayProps {
  rect: DOMRect;
  isOwnMessage: boolean;
  header?: string;
  actions: MobileOverlayAction[];
  onClose: () => void;
  onReaction: (emoji: string) => void;
}

export function MessageMobileOverlay({
  rect,
  isOwnMessage,
  header,
  actions,
  onClose,
  onReaction,
}: MessageMobileOverlayProps) {
  // Lock scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const EMOJI_H = 62;
  const MENU_ITEM_H = 50;
  const HEADER_H = header ? 38 : 0;
  const GAP = 10;
  const SIDE = 16;

  // Emoji bar: above message if space, else below
  const emojiTop =
    rect.top >= EMOJI_H + GAP + 8
      ? rect.top - EMOJI_H - GAP
      : rect.bottom + GAP;

  // Action menu: below message if space, else above
  const menuH = HEADER_H + actions.length * MENU_ITEM_H;
  const actionsTop =
    rect.bottom + GAP + menuH <= vh - 8
      ? rect.bottom + GAP
      : Math.max(8, rect.top - menuH - GAP);

  // Horizontal anchor: right for own messages, left for others
  const actionsStyle: React.CSSProperties = isOwnMessage
    ? { top: actionsTop, right: SIDE }
    : { top: actionsTop, left: SIDE };

  return createPortal(
    <>
      {/* 4-part backdrop — leaves a transparent window over the message */}
      <div
        className="fixed z-[60] bg-black/72"
        style={{ top: 0, left: 0, right: 0, height: rect.top }}
        onClick={onClose}
      />
      <div
        className="fixed z-[60] bg-black/72"
        style={{ top: rect.bottom, left: 0, right: 0, bottom: 0 }}
        onClick={onClose}
      />
      {rect.left > 0 && (
        <div
          className="fixed z-[60] bg-black/72"
          style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }}
          onClick={onClose}
        />
      )}
      {rect.right < vw && (
        <div
          className="fixed z-[60] bg-black/72"
          style={{ top: rect.top, left: rect.right, right: 0, height: rect.height }}
          onClick={onClose}
        />
      )}

      {/* Emoji picker */}
      <div
        className="fixed z-[61] flex items-center bg-zinc-900 border border-zinc-700/80 rounded-full px-2 py-1.5 shadow-2xl"
        style={{ top: emojiTop, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
      >
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="text-[26px] p-1.5 rounded-full active:scale-125 transition-transform leading-none select-none"
            onClick={() => {
              onReaction(emoji);
              onClose();
            }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Action menu */}
      <div
        className="fixed z-[61] min-w-[220px] max-w-[300px] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700/80 shadow-2xl"
        style={actionsStyle}
      >
        {header && (
          <div className="px-4 py-2.5 border-b border-zinc-700/50">
            <p className="text-[11px] text-zinc-400 capitalize">{header}</p>
          </div>
        )}
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              className={cn(
                'w-full flex items-center justify-between gap-4 px-4 py-3.5 text-sm text-left active:bg-white/5 transition-colors',
                i > 0 && 'border-t border-zinc-700/40',
                action.variant === 'destructive' ? 'text-red-400' : 'text-zinc-100',
              )}
              onClick={() => {
                action.onClick();
                onClose();
              }}
            >
              <span>{action.label}</span>
              <Icon size={16} className="opacity-60 shrink-0" />
            </button>
          );
        })}
      </div>
    </>,
    document.body,
  );
}
