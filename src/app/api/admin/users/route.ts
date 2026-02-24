import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { UserInput } from '@/types/user';

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Non authentifie', status: 401 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single();

  const { data: membership } = await supabase
    .from('organisation_members')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['fondateur', 'admin'])
    .limit(1)
    .maybeSingle();

  if (!profile?.is_super_admin && !membership) {
    return { error: 'Acces reserve aux administrateurs', status: 403 };
  }
  return null;
}

export async function POST(request: NextRequest) {
  const authError = await ensureAdmin();
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  let body: UserInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { email, firstName, lastName, status, phone, position } = body;
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email.trim(), {
      data: {
        first_name: firstName?.trim() ?? '',
        last_name: lastName?.trim() ?? '',
        status: status ?? 'active',
        phone: phone ?? '',
        position: position ?? '',
      },
    });
    if (error) {
      return NextResponse.json(
        { error: error.message ?? 'Erreur lors de la creation' },
        { status: 400 }
      );
    }
    if (!data?.user) {
      return NextResponse.json({ error: 'Utilisateur non cree' }, { status: 500 });
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        {
          id: data.user.id,
          firstName: firstName ?? '',
          lastName: lastName ?? '',
          email: data.user.email ?? email,
          status: status ?? 'active',
          isSuperAdmin: false,
          phone: phone ?? undefined,
          position: position ?? undefined,
          registeredAt: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        { status: 201 }
      );
    }

    const user = {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      status: profile.status,
      isSuperAdmin: profile.is_super_admin ?? false,
      phone: profile.phone ?? undefined,
      position: profile.position ?? undefined,
      avatar: profile.avatar ?? undefined,
      registeredAt: profile.registered_at ? new Date(profile.registered_at) : new Date(),
      lastLoginAt: profile.last_login_at ? new Date(profile.last_login_at) : undefined,
      created_at: new Date(profile.created_at),
      updated_at: new Date(profile.updated_at),
    };
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error('Admin create user error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la creation' },
      { status: 500 }
    );
  }
}
