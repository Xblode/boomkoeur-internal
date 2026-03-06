import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrgIntegration } from '@/lib/supabase/integrations';
import type { SumUpCredentials } from '@/lib/supabase/integrations';
import { fetchSumUpTransactions } from '@/lib/integrations/sumup';

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
  return { supabase };
}

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const auth = await ensureOrgAdmin(orgId);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const credentials = await getOrgIntegration<SumUpCredentials>(
    auth.supabase,
    orgId,
    'sumup'
  );

  if (!credentials?.api_key) {
    return NextResponse.json(
      { error: 'SumUp non connecté. Configurez la clé API dans Intégrations.' },
      { status: 400 }
    );
  }

  const startDate = request.nextUrl.searchParams.get('start_date') ?? undefined;
  const endDate = request.nextUrl.searchParams.get('end_date') ?? undefined;
  const limit = request.nextUrl.searchParams.get('limit');
  const limitNum = limit ? parseInt(limit, 10) : 50;

  try {
    const transactions = await fetchSumUpTransactions(credentials, {
      start_date: startDate,
      end_date: endDate,
      limit: limitNum,
    });
    return NextResponse.json({ transactions });
  } catch (err) {
    console.error('SumUp transactions error:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Erreur lors de la récupération des transactions',
      },
      { status: 500 }
    );
  }
}
