import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  publishInstagramImage,
  publishInstagramStory,
  publishInstagramReel,
  publishInstagramCarousel,
} from '@/lib/integrations/meta';
import { resolveDriveUrlForInstagram } from '@/lib/integrations/instagram-media-proxy';

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

type MediaType = 'feed' | 'story' | 'reel' | 'carousel';

interface PublishBody {
  media_type: MediaType;
  image_url?: string;
  video_url?: string;
  images?: string[];
  caption?: string;
  cover_url?: string;
}

export async function POST(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org_id');

  if (!orgId) {
    return NextResponse.json({ error: 'org_id requis' }, { status: 400 });
  }

  const authError = await ensureOrgAdmin(orgId);
  if (authError) {
    return NextResponse.json({ error: authError.error }, { status: authError.status });
  }

  let body: PublishBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const { media_type, image_url, video_url, images, caption, cover_url } = body;

  if (!media_type || !['feed', 'story', 'reel', 'carousel'].includes(media_type)) {
    return NextResponse.json({ error: 'media_type invalide (feed, story, reel, carousel)' }, { status: 400 });
  }

  const resolveUrl = async (url: string, isVideo: boolean): Promise<string> => {
    const resolved = await resolveDriveUrlForInstagram(orgId, url, isVideo);
    if (!resolved) {
      throw new Error(
        'Impossible de récupérer le fichier Google Drive. Vérifiez que Drive est connecté et que le fichier est accessible.'
      );
    }
    return resolved;
  };

  let result: { id: string } | { error: string };

  try {
    switch (media_type) {
      case 'feed':
        if (!image_url?.trim()) {
          return NextResponse.json({ error: 'image_url requis pour feed' }, { status: 400 });
        }
        result = await publishInstagramImage(
          orgId,
          await resolveUrl(image_url.trim(), false),
          caption?.trim()
        );
        break;

      case 'story':
        if (image_url?.trim()) {
          result = await publishInstagramStory(
            orgId,
            await resolveUrl(image_url.trim(), false),
            false
          );
        } else if (video_url?.trim()) {
          result = await publishInstagramStory(
            orgId,
            await resolveUrl(video_url.trim(), true),
            true
          );
        } else {
          return NextResponse.json({ error: 'image_url ou video_url requis pour story' }, { status: 400 });
        }
        break;

      case 'reel':
        if (!video_url?.trim()) {
          return NextResponse.json({ error: 'video_url requis pour reel' }, { status: 400 });
        }
        result = await publishInstagramReel(
          orgId,
          await resolveUrl(video_url.trim(), true),
          caption?.trim(),
          cover_url?.trim() || undefined
        );
        break;

      case 'carousel':
        if (!images?.length || images.length < 2 || images.length > 10) {
          return NextResponse.json({ error: 'images requis (2 à 10) pour carousel' }, { status: 400 });
        }
        result = await publishInstagramCarousel(
          orgId,
          await Promise.all(
            images.map((u) => u.trim()).filter(Boolean).map((u) => resolveUrl(u, false))
          ),
          caption?.trim()
        );
        break;

      default:
        return NextResponse.json({ error: 'media_type non géré' }, { status: 400 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur lors de la résolution du média';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ id: result.id, success: true });
}
