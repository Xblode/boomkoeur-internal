'use client';

import { useState, useEffect, useCallback } from 'react';
import { Switch, Label } from '@/components/ui/atoms';
import { useOrgOptional } from '@/components/providers/OrgProvider';

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
    setSupported(
      typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window
    );
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleToggle = async (checked: boolean) => {
    if (!orgId || saving) return;
    setSaving(true);
    try {
      if (checked) {
        const reg = await navigator.serviceWorker.register('/sw.js');
        if ('ready' in reg && reg.ready instanceof Promise) {
          await reg.ready;
        }
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            setSaving(false);
            return;
          }
        } else if (Notification.permission !== 'granted') {
          setSaving(false);
          return;
        }
        const vapidRes = await fetch('/api/push/vapid-public');
        if (!vapidRes.ok) throw new Error('Push non configuré');
        const { publicKey } = await vapidRes.json();
        if (!publicKey) throw new Error('Clé manquante');
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });
        const subscription = sub.toJSON();
        if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
          throw new Error('Abonnement invalide');
        }
        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
            orgId,
          }),
        });
        if (!res.ok) throw new Error('Erreur enregistrement');
        setEnabled(true);
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
      }
    } catch {
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
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-0.5">
        <Label htmlFor="push-toggle" className="text-sm font-medium">
          Notifications push (messages)
        </Label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Recevez des notifications sur votre téléphone ou ordinateur quand quelqu&apos;un envoie un message.
        </p>
      </div>
      <Switch
        id="push-toggle"
        checked={enabled}
        onCheckedChange={handleToggle}
        disabled={saving}
      />
    </div>
  );
}
