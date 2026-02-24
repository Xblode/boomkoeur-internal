import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getInstagramAccountInfo,
  getAccountInsights,
} from '@/lib/integrations/meta';

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
  const period = request.nextUrl.searchParams.get('period');

  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  const periodDays = period ? parseInt(period, 10) : 7;
  const [accountInfoResult, insightsResult] = await Promise.all([
    getInstagramAccountInfo(orgId),
    getAccountInsights(orgId, periodDays),
  ]);

  const isError = (r: unknown): r is { success: false; reason: string; details?: string; isTransient?: boolean } =>
    typeof r === 'object' && r !== null && 'success' in r && (r as { success: boolean }).success === false;

  const accountInfo = isError(accountInfoResult) ? null : accountInfoResult;
  const insights = isError(insightsResult) ? null : insightsResult;

  if (!accountInfo && !insights) {
    const err = isError(accountInfoResult)
      ? accountInfoResult
      : isError(insightsResult)
        ? insightsResult
        : { reason: 'no_credentials', details: undefined as string | undefined, isTransient: undefined };
    const message =
      err.reason === 'no_credentials'
        ? 'Meta non connecté pour cette organisation'
        : err.details ?? 'Erreur lors du chargement Instagram';
    return NextResponse.json(
      { error: message, reason: err.reason, details: err.details, isTransient: err.isTransient },
      { status: 400 }
    );
  }

  return NextResponse.json({
    account: accountInfo ?? undefined,
    insights: insights ?? undefined,
    period_days: periodDays,
  });
}
