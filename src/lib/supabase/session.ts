/**
 * Mise à jour de la session Supabase dans le proxy.
 * Rafraîchit les tokens expirés et protège les routes /dashboard.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ROUTES } from '@/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Bypass auth en dev si AUTH_DISABLED=true (pour développer sans config Supabase Auth)
  if (process.env.AUTH_DISABLED === 'true') {
    return supabaseResponse;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and getClaims()
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const isAuthRoute =
    request.nextUrl.pathname.startsWith(ROUTES.LOGIN) ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/auth');

  const isDashboardRoute = request.nextUrl.pathname.startsWith(ROUTES.DASHBOARD);
  const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding');

  // Non connecte => login
  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Non connecte => onboarding redirige vers login
  if (!user && isOnboardingRoute) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    return NextResponse.redirect(url);
  }

  // Connecte sur login/register => dashboard (toujours sur dashboard.perret.app en prod)
  if (user && isAuthRoute) {
    const host = request.headers.get('host') ?? '';
    const dashboardUrl =
      process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'https://dashboard.perret.app';
    const isProd = host.includes('perret.app');
    const url = isProd
      ? new URL(ROUTES.DASHBOARD, dashboardUrl)
      : request.nextUrl.clone();
    if (!isProd) url.pathname = ROUTES.DASHBOARD;
    return NextResponse.redirect(url);
  }

  // Connecte sur dashboard => verifier s'il a des orgs
  // La verification fine est faite cote client par l'OrgProvider
  // Le proxy ne peut pas facilement lire la DB, donc on laisse le provider gerer

  return supabaseResponse;
}
