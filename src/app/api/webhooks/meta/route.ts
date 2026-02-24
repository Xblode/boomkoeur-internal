import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook Meta / Instagram - Vérification et réception des événements
 *
 * Configuration dans Meta Developer Console :
 * - URL de rappel : https://ton-domaine.com/api/webhooks/meta
 * - Jeton de vérification : même valeur que META_WEBHOOK_VERIFY_TOKEN dans .env.local
 */

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error('[Meta Webhook] META_WEBHOOK_VERIFY_TOKEN non configuré dans .env.local');
    return NextResponse.json({ error: 'Webhook non configuré' }, { status: 500 });
  }

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ error: 'Validation échouée' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  // Meta envoie les événements en POST - on répond 200 pour confirmer la réception
  try {
    const body = await request.json();
    // Optionnel : traiter les événements (comments, messages, etc.)
    if (process.env.NODE_ENV === 'development' && body?.object) {
      console.log('[Meta Webhook] Événement reçu:', body.object, body.entry?.length ?? 0, 'entries');
    }
  } catch {
    // Ignorer les erreurs de parsing
  }
  return new NextResponse('OK', { status: 200 });
}
