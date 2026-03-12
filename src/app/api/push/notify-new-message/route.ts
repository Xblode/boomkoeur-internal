import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendPushNotification,
  isPushConfigured,
  type PushSubscriptionRow,
} from '@/lib/push';

export async function POST(request: NextRequest) {
  if (!isPushConfigured()) {
    return NextResponse.json({ ok: false, reason: 'Push non configuré' });
  }

  const body = await request.json();
  const { orgId, authorId, authorName, content } = body as {
    orgId?: string;
    authorId?: string | null;
    authorName?: string;
    content?: string;
  };

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

  const admin = createAdminClient();
  const excludeUserId = authorId ?? user.id;
  const { data: subscriptions, error } = await admin
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth')
    .eq('org_id', orgId)
    .neq('user_id', excludeUserId);

  if (error || !subscriptions?.length) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const title = authorName ? authorName : 'Nouveau message';
  const notificationBody = content
    ? (content.length > 100 ? content.slice(0, 97) + '...' : content)
    : 'Vous avez reçu un nouveau message';

  let sent = 0;
  for (const sub of subscriptions as PushSubscriptionRow[]) {
    const ok = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      { title, body: notificationBody, data: { url: '/dashboard/messages' } }
    );
    if (ok) sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
