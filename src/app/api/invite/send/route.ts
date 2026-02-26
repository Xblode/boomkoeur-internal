import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function ensureAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Non authentifié', status: 401 };
  }

  const { data: membership } = await supabase
    .from('organisation_members')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['fondateur', 'admin'])
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return { error: 'Accès réservé aux administrateurs', status: 403 };
  }
  return null;
}

/**
 * POST /api/invite/send
 * Envoie une invitation par email via Supabase Auth.
 * Body: { email: string, inviteToken: string }
 */
export async function POST(request: NextRequest) {
  const authError = await ensureAdmin();
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  let body: { email?: string; inviteToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { email, inviteToken } = body;
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }
  if (!inviteToken?.trim()) {
    return NextResponse.json({ error: 'Token d\'invitation requis' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (request.nextUrl.origin || 'https://dashboard.perret.app');
  const redirectTo = `${appUrl}/onboarding?invite=${encodeURIComponent(inviteToken.trim())}`;

  const admin = createAdminClient();

  try {
    const { error } = await admin.auth.admin.inviteUserByEmail(email.trim(), {
      redirectTo,
    });
    if (error) {
      return NextResponse.json(
        { error: error.message ?? 'Erreur lors de l\'envoi de l\'invitation' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Invite send error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'envoi' },
      { status: 500 }
    );
  }
}
