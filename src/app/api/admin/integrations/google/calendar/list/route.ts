import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCalendarClient } from '@/lib/integrations/google';

async function ensureOrgMember(orgId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Non authentifié', status: 401 };
  }

  const { data } = await supabase.rpc('user_belongs_to_org', { oid: orgId });
  if (!data) {
    return { error: "Accès réservé aux membres de l'organisation", status: 403 };
  }
  return null;
}

export interface GoogleCalendarItem {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  accessRole?: string;
}

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');

  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const authError = await ensureOrgMember(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const calendar = await getCalendarClient(orgId);
  if (!calendar) {
    return NextResponse.json(
      {
        error:
          'Google Calendar non connecté. Configurez l\'intégration dans Administration > Intégrations.',
      },
      { status: 400 }
    );
  }

  try {
    const response = await calendar.calendarList.list();
    const items = (response.data.items ?? []).map((cal) => ({
      id: cal.id ?? '',
      summary: cal.summary ?? 'Sans nom',
      description: cal.description ?? undefined,
      primary: cal.primary === true,
      accessRole: cal.accessRole ?? undefined,
    }));

    return NextResponse.json({ calendars: items });
  } catch (err: unknown) {
    const isScopeError =
      err instanceof Error &&
      /insufficient authentication scopes/i.test(err.message);
    const message =
      isScopeError
        ? 'Permissions Google Calendar insuffisantes. Déconnectez puis reconnectez l\'intégration Google dans Administration > Intégrations pour accorder l\'accès aux calendriers.'
        : err instanceof Error
          ? err.message
          : 'Erreur lors du chargement des calendriers';
    console.error('Calendar list error:', err);
    return NextResponse.json({ error: message }, { status: isScopeError ? 403 : 500 });
  }
}
