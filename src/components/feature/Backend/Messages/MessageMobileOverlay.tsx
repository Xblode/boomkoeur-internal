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

  const EMOJI_H     = 62;
  const ITEM_H      = 52;
  const HEADER_H    = header ? 40 : 0;
  const MENU_GAP    = 10;   // distance message → menu d'actions
  const EMOJI_GAP   = 4;    // distance message → emoji bar (plus proche)
  const SIDE        = 16;
  const SAFE        = 8;

  const menuH = HEADER_H + actions.length * ITEM_H;

  // ── Position verticale du message ─────────────────────────────────────────
  // On remonte le message si nécessaire pour que le menu d'actions tienne en dessous
  const maxTop      = vh - rect.height - MENU_GAP - menuH - SAFE;
  const adjustedTop = Math.min(rect.top, Math.max(SAFE, maxTop));
  const adjustedBottom = adjustedTop + rect.height;

  // ── Emoji bar : au-dessus du message (peut chevaucher si pas de place) ────
  const emojiBarTop = Math.max(SAFE, adjustedTop - EMOJI_H - EMOJI_GAP);

  // ── Menu d'actions : toujours en dessous du message ───────────────────────
  const actionsTop = adjustedBottom + MENU_GAP;

  // Ancrage horizontal du menu
  const actionsStyle: React.CSSProperties = isOwnMessage
    ? { top: actionsTop, right: SIDE }
    : { top: actionsTop, left: SIDE };

  // z-index au-dessus du MessagesDrawer (z-70/71) pour afficher correctement dans le drawer mobile
  const Z_BACKDROP = 80;
  const Z_MESSAGE = 82;
  const Z_MENU = 83;

  return createPortal(
    <>
      {/* Backdrop plein écran avec flou */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: Z_BACKDROP }}
        onClick={onClose}
      />

      {/* Clone du message à la position ajustée + animation bouing */}
      {children && (
        <div
          className="fixed pointer-events-none animate-mobile-ctx-pop"
          style={{
            zIndex: Z_MESSAGE,
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
        className="fixed flex items-center bg-card-bg rounded-full px-2 py-1.5 shadow-md"
        style={{
          zIndex: Z_MENU,
          top: emojiBarTop,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
        }}
      >
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="text-[26px] p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-125 transition-all leading-none select-none"
            onClick={() => { onReaction(emoji); onClose(); }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Menu d'actions */}
      <div
        className={cn(
          'fixed min-w-[220px] max-w-[300px] rounded-xl overflow-hidden',
          'bg-card-bg shadow-md',
        )}
        style={{ ...actionsStyle, zIndex: Z_MENU }}
      >
        {header && (
          <div className="px-4 py-2.5">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 capitalize">{header}</p>
          </div>
        )}
        {actions.map((action) => {
          const Icon = action.icon;
          const isDestructive = action.variant === 'destructive';
          return (
            <button
              key={action.id}
              type="button"
              className={cn(
                'w-full flex items-center gap-2.5 min-h-[44px] px-5 py-3.5 text-base text-left transition-colors',
                isDestructive
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800',
              )}
              onClick={() => { action.onClick(); onClose(); }}
            >
              <Icon className="shrink-0 w-[18px] h-[18px]" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </>,
    document.body,
  );
}
