/**
 * API Démo : Connexion automatique au compte démo
 * POST /api/demo/enter
 * Redirige vers le dashboard avec une session démo active.
 * Nécessite DEMO_PASSWORD dans .env.local
 */

import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ROUTES } from '@/lib/constants';

const DEMO_EMAIL = 'demo@perret.app';

export async function POST(request: NextRequest) {
  const password = process.env.DEMO_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: 'Démo non configurée (DEMO_PASSWORD manquant)' },
      { status: 503 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Configuration Supabase manquante' },
      { status: 503 }
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password,
  });

  if (error) {
    return NextResponse.json(
      { error: 'Impossible de se connecter au compte démo. Vérifiez que demo@perret.app existe et que le seed a été exécuté.' },
      { status: 401 }
    );
  }

  const url = request.nextUrl.clone();
  url.pathname = ROUTES.DASHBOARD;
  url.search = '';

  return NextResponse.redirect(url, 302);
}
