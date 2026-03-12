/**
 * Web Push - Notifications
 * Utilise web-push avec clés VAPID.
 * Générer les clés : npx web-push generate-vapid-keys
 */

import webpush from 'web-push';

const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

export function isPushConfigured(): boolean {
  return !!(vapidPublic && vapidPrivate);
}

export function getVapidPublicKey(): string | null {
  return vapidPublic ?? null;
}

export function initWebPush(): void {
  if (vapidPublic && vapidPrivate) {
    webpush.setVapidDetails(
      'mailto:support@perret.app',
      vapidPublic,
      vapidPrivate
    );
  }
}

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  org_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body?: string; data?: Record<string, unknown> }
): Promise<boolean> {
  if (!vapidPrivate) return false;
  initWebPush();
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body ?? '',
        data: payload.data ?? { url: '/dashboard/messages' },
      }),
      { TTL: 60 * 60 * 24 }
    );
    return true;
  } catch {
    return false;
  }
}
