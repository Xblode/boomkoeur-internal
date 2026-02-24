import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Non authentifié', status: 401 };
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await ensureAdmin();
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      return NextResponse.json(
        { error: error.message ?? 'Erreur lors de la suppression' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Admin delete user error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression' },
      { status: 500 }
    );
  }
}
