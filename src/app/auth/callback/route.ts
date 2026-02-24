/**
 * Callback OAuth Supabase.
 * Échange le code d'autorisation contre une session.
 * Requis pour magic link, OAuth (Google, etc.).
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { ROUTES } from '@/lib/constants';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? ROUTES.DASHBOARD;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
