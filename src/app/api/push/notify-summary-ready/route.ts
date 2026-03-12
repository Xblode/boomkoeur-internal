import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  sendPushNotification,
  isPushConfigured,
  type PushSubscriptionRow,
} from '@/lib/push';

/**
 * Envoie une notification push à l'utilisateur connecté quand une synthèse de jour est disponible.
 * Utilisé quand l'utilisateur change de jour dans le chat et que la synthèse est chargée.
 */
export async function POST(request: NextRequest) {
  if (!isPushConfigured()) {
    return NextResponse.json({ ok: false, reason: 'Push non configuré' });
  }

  const body = await request.json();
  const { orgId, dateLabel } = body as { orgId?: string; dateLabel?: string };

  if (!orgId) {
    return NextResponse.json({ error: 'orgId requis' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('org_id', orgId)
    .eq('user_id', user.id);

  if (error || !subscriptions?.length) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const title = 'Synthèse disponible';
  const bodyText = dateLabel
    ? `Synthèse du ${dateLabel} disponible`
    : 'Une synthèse de jour est disponible';

  let sent = 0;
  for (const sub of subscriptions as PushSubscriptionRow[]) {
    const ok = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      { title, body: bodyText, data: { url: '/dashboard/messages' } }
    );
    if (ok) sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
