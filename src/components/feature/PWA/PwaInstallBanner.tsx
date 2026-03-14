'use client';

import { useEffect, useState } from 'react';
import { X, Download, Share } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

const DISMISSED_KEY = 'pwa-install-banner-dismissed';
const DISMISS_EXPIRY_DAYS = 14;

function wasDismissedRecently(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(DISMISSED_KEY);
  if (!raw) return false;
  try {
    const ts = Number(raw);
    const daysSince = (Date.now() - ts) / (1000 * 60 * 60 * 24);
    return daysSince < DISMISS_EXPIRY_DAYS;
  } catch {
    return false;
  }
}

export function PwaInstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (wasDismissedRecently()) return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);

    if (isStandalone) return;

    const ua = navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);

    if (iosDevice) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 left-3 right-3 z-[80] sm:left-auto sm:right-4 sm:bottom-6 sm:w-80',
        'bg-backend border border-border-custom rounded-2xl shadow-2xl p-4',
        'flex items-start gap-3'
      )}
      role="alertdialog"
      aria-label="Installer l'application"
    >
      {/* Icône app */}
      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        <img src="/favicon-96x96.png" alt="Perret" className="w-10 h-10 object-contain" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
          Installer Perret
        </p>
        {isIOS ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
            Appuyez sur{' '}
            <span className="inline-flex items-center gap-0.5 font-medium text-zinc-700 dark:text-zinc-300">
              <Share size={11} className="shrink-0" />
              Partager
            </span>{' '}
            puis <span className="font-medium text-zinc-700 dark:text-zinc-300">&ldquo;Ajouter à l&apos;écran d&apos;accueil&rdquo;</span>
          </p>
        ) : (
          <>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
              Accès rapide depuis votre écran d&apos;accueil, même hors ligne.
            </p>
            <button
              type="button"
              onClick={handleInstall}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Download size={13} />
              Installer
            </button>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 p-1 -m-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        aria-label="Fermer"
      >
        <X size={16} />
      </button>
    </div>
  );
}
