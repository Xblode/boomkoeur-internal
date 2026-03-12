/**
 * Proxy pour les images des messages (Supabase storage).
 * Utilise le client Supabase pour respecter l'authentification.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function extractStoragePath(url: string): string | null {
  // https://xxx.supabase.co/storage/v1/object/public/messages-attachments/org/file.jpg
  const withoutQuery = url.split('?')[0];
  const m = withoutQuery.match(/messages-attachments\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url?.startsWith('http')) {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
  }

  if (!url.includes('supabase.co/storage') || !url.includes('messages-attachments')) {
    return NextResponse.json({ error: 'URL non autorisée' }, { status: 403 });
  }

  const path = extractStoragePath(url);
  if (!path) {
    return NextResponse.json({ error: 'Chemin invalide' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase.storage
      .from('messages-attachments')
      .download(path);

    if (error || !data) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
    }

    const ext = path.split('.').pop()?.toLowerCase() ?? 'jpg';
    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    const contentType = contentTypeMap[ext] ?? 'image/jpeg';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[Attachment proxy] Error:', err);
    return NextResponse.json(
      { error: "Impossible de charger l'image" },
      { status: 500 }
    );
  }
}
