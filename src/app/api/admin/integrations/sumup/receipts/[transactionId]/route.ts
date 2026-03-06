import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrgIntegration } from '@/lib/supabase/integrations';
import type { SumUpCredentials } from '@/lib/supabase/integrations';
import { fetchSumUpReceipt } from '@/lib/integrations/sumup';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  const { transactionId } = await params;

  if (!orgId || !transactionId) {
    return NextResponse.json(
      { error: 'org_id et transactionId requis' },
      { status: 400 }
    );
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
      { error: 'SumUp non connecté' },
      { status: 400 }
    );
  }

  try {
    const receipt = await fetchSumUpReceipt(credentials, transactionId);
    if (!receipt) {
      return NextResponse.json(
        { error: 'Reçu non trouvé' },
        { status: 404 }
      );
    }
    return NextResponse.json({ receipt });
  } catch (err) {
    console.error('SumUp receipt error:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Erreur lors de la récupération du reçu',
      },
      { status: 500 }
    );
  }
}
