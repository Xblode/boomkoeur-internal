import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { endpoint, keys, orgId } = body as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
    orgId?: string;
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth || !orgId) {
    return NextResponse.json(
      { error: 'endpoint, keys.p256dh, keys.auth et orgId requis' },
      { status: 400 }
    );
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

  const userAgent = request.headers.get('user-agent') ?? undefined;

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      org_id: orgId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: userAgent,
    },
    {
      onConflict: 'user_id,org_id,endpoint',
    }
  );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
