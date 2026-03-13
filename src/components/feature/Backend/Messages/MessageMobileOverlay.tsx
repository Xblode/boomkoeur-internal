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
  /** Bounding rect du message dans sa position originale */
  rect: DOMRect;
  isOwnMessage: boolean;
  header?: string;
  actions: MobileOverlayAction[];
  onClose: () => void;
  onReaction: (emoji: string) => void;
  /** Contenu visuel du message à afficher dans l'overlay (clone sans interactions) */
  children?: React.ReactNode;
}

export function MessageMobileOverlay({
  rect,
  isOwnMessage,
  header,
  actions,
  onClose,
  onReaction,
  children,
}: MessageMobileOverlayProps) {
  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const EMOJI_H  = 62;
  const ITEM_H   = 50;
  const HEADER_H = header ? 40 : 0;
  const GAP      = 10;
  const SIDE     = 16;
  const SAFE     = 8;

  const menuH = HEADER_H + actions.length * ITEM_H;

  // ── Position verticale du message ─────────────────────────────────────────
  // On remonte le message si nécessaire pour que le menu d'actions tienne en dessous
  const maxTop     = vh - rect.height - GAP - menuH - SAFE;
  const adjustedTop = Math.min(rect.top, Math.max(SAFE, maxTop));
  const adjustedBottom = adjustedTop + rect.height;

  // ── Emoji bar : au-dessus du message (peut chevaucher si pas de place) ────
  const emojiBarTop = Math.max(SAFE, adjustedTop - EMOJI_H - GAP);

  // ── Menu d'actions : toujours en dessous du message ───────────────────────
  const actionsTop = adjustedBottom + GAP;

  // Ancrage horizontal du menu
  const actionsStyle: React.CSSProperties = isOwnMessage
    ? { top: actionsTop, right: SIDE }
    : { top: actionsTop, left: SIDE };

  return createPortal(
    <>
      {/* Backdrop plein écran */}
      <div
        className="fixed inset-0 z-[60] bg-black/72"
        onClick={onClose}
      />

      {/* Clone du message à la position ajustée + animation bouing */}
      {children && (
        <div
          className="fixed z-[62] pointer-events-none animate-mobile-ctx-pop"
          style={{
            top: adjustedTop,
            left: rect.left,
            width: rect.width,
          }}
        >
          {children}
        </div>
      )}

      {/* Emoji picker */}
      <div
        className="fixed z-[63] flex items-center bg-zinc-900 border border-zinc-700/80 rounded-full px-2 py-1.5 shadow-2xl"
        style={{ top: emojiBarTop, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
      >
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="text-[26px] p-1.5 rounded-full active:scale-125 transition-transform leading-none select-none"
            onClick={() => { onReaction(emoji); onClose(); }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Menu d'actions */}
      <div
        className={cn(
          'fixed z-[63] min-w-[220px] max-w-[300px] rounded-2xl overflow-hidden',
          'bg-zinc-900 border border-zinc-700/80 shadow-2xl',
        )}
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
                'w-full flex items-center justify-between gap-4 px-4 py-3.5 text-sm text-left active:bg-white/5',
                i > 0 && 'border-t border-zinc-700/40',
                action.variant === 'destructive' ? 'text-red-400' : 'text-zinc-100',
              )}
              onClick={() => { action.onClick(); onClose(); }}
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
