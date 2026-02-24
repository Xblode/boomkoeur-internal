import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSheetsClient } from '@/lib/integrations/google';
import { parseGoogleSheetId } from '@/lib/integrations/google-utils';

async function ensureOrgAdmin(orgId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Non authentifié', status: 401 };
  }

  const { data } = await supabase.rpc('is_org_admin', {
    uid: user.id,
    oid: orgId,
  });
  if (!data) {
    return { error: "Accès réservé aux administrateurs de l'organisation", status: 403 };
  }
  return null;
}

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  const spreadsheetId = request.nextUrl.searchParams.get('spreadsheet_id');
  const url = request.nextUrl.searchParams.get('url');
  const range = request.nextUrl.searchParams.get('range');

  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const sheetId = spreadsheetId ?? (url ? parseGoogleSheetId(url) : null);
  if (!sheetId) {
    return NextResponse.json(
      { error: 'spreadsheet_id ou url (Google Sheet) requis' },
      { status: 400 }
    );
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const sheets = await getSheetsClient(orgId);
  if (!sheets) {
    return NextResponse.json(
      {
        error:
          'Google Sheets non connecté. Configurez l\'intégration dans Administration > Intégrations.',
      },
      { status: 400 }
    );
  }

  try {
    const targetRange = range ?? 'A1:Z1000';
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: targetRange,
    });

    const values = (response.data.values ?? []) as string[][];
    return NextResponse.json({ values });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Erreur lors du chargement du tableur';
    console.error('Sheets content error:', err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
