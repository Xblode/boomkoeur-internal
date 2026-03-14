'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'pwa-install-banner-dismissed';
const VISIT_COUNT_KEY = 'pwa-dashboard-visit-count';
const MIN_VISITS_FOR_BANNER = 2;

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function getVisitCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? '0', 10);
  } catch {
    return 0;
  }
}

function incrementVisitCount(): void {
  try {
    const n = getVisitCount() + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(n));
  } catch {
    /* ignore */
  }
}

function wasDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

export function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => Promise<void> } | null>(null);

  const dismiss = useCallback(() => {
    setShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      dismiss();
    } else {
      dismiss();
    }
  }, [deferredPrompt, dismiss]);

  useEffect(() => {
    if (!isMobile() || isStandalone() || wasDismissed()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as { prompt: () => Promise<void> });
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (isIOS()) {
      incrementVisitCount();
      if (getVisitCount() >= MIN_VISITS_FOR_BANNER) {
        setShow(true);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed top-[52px] left-0 right-0 z-50 flex items-center justify-between gap-3',
        'bg-backend border-b border-border-custom px-4 py-3 shadow-lg',
        'pt-3'
      )}
      role="banner"
      aria-label="Installer l'application"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <Download size={20} className="text-zinc-600 dark:text-zinc-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Installer Perret</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {deferredPrompt
              ? 'Ajoutez l\'app sur votre écran d\'accueil pour un accès rapide.'
              : 'Utilisez le menu du navigateur pour ajouter à l\'écran d\'accueil.'}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {deferredPrompt && (
          <Button variant="primary" size="sm" onClick={handleInstall}>
            Installer
          </Button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          aria-label="Fermer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
