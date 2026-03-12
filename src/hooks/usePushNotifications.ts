'use client';

import { useEffect, useRef, useCallback } from 'react';

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

export function usePushNotifications(orgId: string | null) {
  const registeredRef = useRef(false);

  const register = useCallback(async () => {
    if (!orgId || registeredRef.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const reg = await navigator.serviceWorker.register('/push-worker', { scope: '/' });
      if ('ready' in reg && reg.ready instanceof Promise) {
        await reg.ready;
      }

      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;
      } else if (Notification.permission !== 'granted') {
        return;
      }

      const vapidRes = await fetch('/api/push/vapid-public');
      if (!vapidRes.ok) return;
      const { publicKey } = await vapidRes.json();
      if (!publicKey) return;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const subscription = sub.toJSON();
      if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) return;

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
          orgId,
        }),
      });
      registeredRef.current = true;
    } catch {
      // Silently fail
    }
  }, [orgId]);

  useEffect(() => {
    if (!orgId) return;
    register();
  }, [orgId, register]);
}
