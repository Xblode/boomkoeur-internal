import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getOrgIntegration,
  upsertOrgIntegration,
  type IntegrationProvider,
  type ShotgunCredentials,
} from '@/lib/supabase/integrations';

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
    return { error: 'Accès réservé aux administrateurs de l\'organisation', status: 403 };
  }
  return { supabase, user };
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

  const provider = request.nextUrl.searchParams.get('provider') as IntegrationProvider | null;
  if (!provider || !['shotgun', 'meta', 'google'].includes(provider)) {
    return NextResponse.json({ error: 'provider invalide (shotgun, meta, google)' }, { status: 400 });
  }

  const config = await getOrgIntegration(auth.supabase, orgId, provider);
  if (!config) {
    return NextResponse.json({ connected: false });
  }

  // Pour Google : connecté uniquement si on a les tokens OAuth (pas juste la config Client ID/Secret)
  const isGoogleConnected =
    provider === 'google' &&
    'access_token' in config &&
    'refresh_token' in config &&
    !!config.access_token &&
    !!config.refresh_token;

  const response: { connected: boolean; hasCredentials?: boolean; email?: string } = {
    connected: provider === 'google' ? isGoogleConnected : true,
    hasCredentials: true,
  };
  if (provider === 'google' && isGoogleConnected && 'email' in config && config.email) {
    response.email = config.email;
  }
  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  let body: { org_id: string; provider: IntegrationProvider; credentials: ShotgunCredentials };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { org_id, provider, credentials } = body;
  if (!org_id || !provider || !credentials) {
    return NextResponse.json(
      { error: 'org_id, provider et credentials requis' },
      { status: 400 }
    );
  }

  if (provider !== 'shotgun') {
    return NextResponse.json(
      { error: 'Meta utilise le flux OAuth. Utilisez le bouton "Connecter avec Facebook".' },
      { status: 400 }
    );
  }

  const auth = await ensureOrgAdmin(org_id);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const c = credentials as ShotgunCredentials;
  if (!c.organizerId?.trim() || !c.apiToken?.trim()) {
    return NextResponse.json(
      { error: 'organizerId et apiToken requis pour Shotgun' },
      { status: 400 }
    );
  }

  try {
    await upsertOrgIntegration(auth.supabase, org_id, provider, credentials);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Integration upsert error:', err);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement' },
      { status: 500 }
    );
  }
}
