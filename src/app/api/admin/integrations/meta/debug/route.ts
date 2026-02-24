import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    return { error: "Accès réservé aux administrateurs", status: 403 };
  }
  return null;
}

/**
 * Route de diagnostic Meta/Instagram - à utiliser uniquement en développement.
 * Appel direct à l'API Instagram pour voir la réponse brute.
 */
export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');
  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  // Import dynamique pour éviter d'exposer getCredentialsForOrg
  const { createAdminClient } = await import('@/lib/supabase/admin');
  const { decrypt } = await import('@/lib/integrations/encryption');

  const admin = createAdminClient();
  const { data: row, error: dbError } = await admin
    .from('organisation_integrations')
    .select('encrypted_credentials')
    .eq('org_id', orgId)
    .eq('provider', 'meta')
    .maybeSingle();

  if (dbError) {
    return NextResponse.json({
      ok: false,
      step: 'database',
      error: dbError.message,
    });
  }

  if (!row?.encrypted_credentials) {
    return NextResponse.json({
      ok: false,
      step: 'credentials',
      error: 'Aucune configuration Meta pour cette organisation',
    });
  }

  let creds: { access_token?: string; page_access_token?: string; ig_user_id?: string };
  try {
    const plain = await decrypt(row.encrypted_credentials);
    creds = JSON.parse(plain);
  } catch (e) {
    return NextResponse.json({
      ok: false,
      step: 'decrypt',
      error: e instanceof Error ? e.message : 'Erreur de déchiffrement',
    });
  }

  const token = creds.access_token ?? creds.page_access_token;
  const igUserId = creds.ig_user_id;

  if (!token || !igUserId) {
    return NextResponse.json({
      ok: false,
      step: 'credentials',
      error: 'Token ou ig_user_id manquant dans les credentials',
      hasToken: !!token,
      hasIgUserId: !!igUserId,
    });
  }

  // Appel direct à l'API Instagram
  const url = `https://graph.instagram.com/v21.0/${igUserId}?fields=username,followers_count,media_count&access_token=${token}`;
  const res = await fetch(url);
  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  const hasError = typeof json === 'object' && json !== null && 'error' in json;

  return NextResponse.json({
    ok: !hasError && res.ok,
    step: 'instagram_api',
    httpStatus: res.status,
    response: json,
    hint: hasError
      ? 'Instagram renvoie une erreur. Vérifiez le token (reconnectez Meta), les permissions de l\'app, et le type de compte (Business/Creator).'
      : res.ok
        ? 'Connexion OK'
        : 'Réponse inattendue',
  });
}
