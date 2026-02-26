/**
 * Proxy : routage par domaine (perret.app / dashboard.perret.app) + session Supabase
 */

import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/session';

const FRONTEND_DOMAIN = 'perret.app';
const DASHBOARD_DOMAIN = 'dashboard.perret.app';

export async function proxy(request: NextRequest) {
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    '';
  const pathname = request.nextUrl.pathname;

  // Routage par domaine (production uniquement, pas en localhost)
  const isProdDomain = host.includes(FRONTEND_DOMAIN) || host.includes(DASHBOARD_DOMAIN);
  if (isProdDomain && !host.includes('localhost')) {
    const isDashboardHost =
      host === DASHBOARD_DOMAIN || host.startsWith(DASHBOARD_DOMAIN + ':');

    // perret.app + /dashboard/* → dashboard.perret.app/dashboard/*
    if (!isDashboardHost && pathname.startsWith('/dashboard')) {
      const url = new URL(request.url);
      url.host = DASHBOARD_DOMAIN;
      url.protocol = 'https:';
      return NextResponse.redirect(url, 302);
    }

    // dashboard.perret.app + / (racine) → /dashboard
    if (isDashboardHost && (pathname === '/' || pathname === '')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url, 302);
    }

    // dashboard.perret.app + routes frontend (/contact, etc.) → perret.app
    if (isDashboardHost && !pathname.startsWith('/dashboard') && !pathname.startsWith('/login') && !pathname.startsWith('/register') && !pathname.startsWith('/auth') && !pathname.startsWith('/onboarding') && !pathname.startsWith('/api')) {
      const url = new URL(request.url);
      url.host = FRONTEND_DOMAIN;
      url.protocol = 'https:';
      return NextResponse.redirect(url, 302);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
