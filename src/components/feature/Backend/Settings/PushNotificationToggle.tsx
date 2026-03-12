'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Switch, Label, Button } from '@/components/ui/atoms';
import { useOrgOptional } from '@/components/providers/OrgProvider';

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  return (window.matchMedia('(display-mode: standalone)').matches)
    || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationToggle() {
  const orgContext = useOrgOptional();
  const orgId = orgContext?.activeOrg?.id ?? null;
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supported, setSupported] = useState(false);
  const [needsHomeScreen, setNeedsHomeScreen] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!orgId) return;
    try {
      const res = await fetch(`/api/push/status?orgId=${encodeURIComponent(orgId)}`);
      if (res.ok) {
        const { enabled: e } = await res.json();
        setEnabled(e);
      }
    } catch {
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    const ok = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(ok);
    setNeedsHomeScreen(ok && isIOS() && !isStandalonePWA());
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleToggle = async (checked: boolean) => {
    if (!orgId || saving) return;
    if (checked && needsHomeScreen) {
      toast.error(
        'Sur iPhone, ajoutez l\'app à l\'écran d\'accueil pour activer les notifications. Utilisez le bouton Partager puis "Sur l\'écran d\'accueil".'
      );
      return;
    }
    setSaving(true);
    const toastId = toast.loading(checked ? 'Activation en cours…' : 'Désactivation…');
    try {
      if (checked) {
        toast.loading('Demande de permission…', { id: toastId });
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            toast.error('Autorisation refusée. Les notifications ne fonctionneront pas.', { id: toastId });
            setSaving(false);
            return;
          }
        } else if (Notification.permission !== 'granted') {
          toast.error('Les notifications sont bloquées. Autorisez-les dans Réglages > Notifications.', { id: toastId });
          setSaving(false);
          return;
        }
        toast.loading('Enregistrement du service worker…', { id: toastId });
        const reg = await navigator.serviceWorker.register('/sw', { scope: '/' });
        if ('ready' in reg && reg.ready instanceof Promise) {
          await reg.ready;
        }
        toast.loading('Récupération de la clé…', { id: toastId });
        const vapidRes = await fetch('/api/push/vapid-public');
        if (!vapidRes.ok) throw new Error('Push non configuré côté serveur');
        const { publicKey } = await vapidRes.json();
        if (!publicKey) throw new Error('Clé VAPID manquante');
        toast.loading('Abonnement aux notifications…', { id: toastId });
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });
        const subscription = sub.toJSON();
        if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
          throw new Error('Abonnement invalide (données manquantes)');
        }
        toast.loading('Enregistrement sur le serveur…', { id: toastId });
        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
            orgId,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? 'Erreur enregistrement serveur');
        }
        setEnabled(true);
        toast.success('Notifications activées', { id: toastId });
      } else {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) await sub.unsubscribe();
        }
        const res = await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgId }),
        });
        if (!res.ok) throw new Error('Erreur désactivation');
        setEnabled(false);
        toast.success('Notifications désactivées', { id: toastId });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inattendue';
      toast.error(msg, { id: toastId });
      await fetchStatus();
    } finally {
      setSaving(false);
    }
  };

  if (!supported) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Les notifications push ne sont pas supportées par votre navigateur.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-5 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <span className="text-sm text-zinc-500">Chargement…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-0.5">
        <Label htmlFor="push-toggle" className="text-sm font-medium">
          Notifications push (messages)
        </Label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {needsHomeScreen
            ? 'Sur iPhone : ajoutez l\'app à l\'écran d\'accueil (Partager → Sur l\'écran d\'accueil) pour activer les notifications.'
            : 'Recevez des notifications sur votre téléphone ou ordinateur quand quelqu\'un envoie un message.'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isIOS() && !enabled && !saving && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleToggle(true)}
          >
            Activer
          </Button>
        )}
        <Switch
          id="push-toggle"
          checked={enabled}
          onCheckedChange={handleToggle}
          disabled={saving}
        />
      </div>
    </div>
  );
}
