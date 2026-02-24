'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEventDetail } from './EventDetailProvider';
import { useOrg } from '@/hooks';
import { Button } from '@/components/ui/atoms';
import { EmptyState, Card, CardContent } from '@/components/ui/molecules';
import {
  RefreshCw,
  Loader2,
  Instagram,
  Heart,
  MessageCircle,
  Eye,
  ExternalLink,
  Send,
  Users,
  Image,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  permalink?: string;
  caption?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

interface MediaWithInsights extends InstagramMedia {
  insights?: { reach?: number; impressions?: number; engagement?: number };
}

export function EventInstagramStats() {
  const { event } = useEventDetail();
  const { activeOrg } = useOrg();
  const [media, setMedia] = useState<MediaWithInsights[]>([]);
  const [accountStats, setAccountStats] = useState<{
    account?: { username?: string; followers_count?: number; media_count?: number };
    insights?: { reach?: number; accounts_engaged?: number; impressions?: number };
    period_days?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<
    string | { message: string; reason?: string; details?: string; isTransient?: boolean } | null
  >(null);
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);

  const orgId = event.orgId ?? activeOrg?.id;

  const fetchMedia = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      setError('Organisation non définie');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [mediaRes, statsRes] = await Promise.all([
        fetch(`/api/admin/integrations/meta/instagram/media?org_id=${orgId}`),
        fetch(
          `/api/admin/integrations/meta/instagram/account/insights?org_id=${orgId}&period=7`
        ),
      ]);
      const mediaData = await mediaRes.json();
      const statsData = await statsRes.json();

      if (!mediaRes.ok) {
        const msg = mediaData.error ?? 'Erreur lors du chargement';
        const err = new Error(msg) as Error & { reason?: string; details?: string; isTransient?: boolean };
        err.reason = mediaData.reason;
        err.details = mediaData.details;
        err.isTransient = mediaData.isTransient;
        throw err;
      }
      const items = (mediaData.data ?? []) as InstagramMedia[];
      setMedia(items);

      if (statsRes.ok && statsData) {
        setAccountStats(statsData);
      } else {
        setAccountStats(null);
      }
    } catch (err) {
      const e = err as Error & { reason?: string; details?: string; isTransient?: boolean };
      if (err instanceof Error && (e.reason != null || e.isTransient != null)) {
        setError({
          message: e.message,
          reason: e.reason,
          details: e.details,
          isTransient: e.isTransient,
        });
      } else {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      }
      setMedia([]);
      setAccountStats(null);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const fetchInsightsForMedia = useCallback(
    async (mediaId: string) => {
      if (!orgId) return;
      try {
        const res = await fetch(
          `/api/admin/integrations/meta/instagram/media/${mediaId}/insights?org_id=${orgId}`
        );
        const data = await res.json();
        if (res.ok && data) {
          setMedia((prev) =>
            prev.map((m) =>
              m.id === mediaId ? { ...m, insights: data } : m
            )
          );
        }
      } catch {
        // Silently fail for insights
      }
    },
    [orgId]
  );

  const handlePublishPost = useCallback(
    async (post: { id: string; visuals?: Array<{ url: string }>; bio?: string }) => {
      if (!orgId) return;
      const imageUrl = post.visuals?.[0]?.url;
      if (!imageUrl) return;
      setPublishingPostId(post.id);
      try {
        const res = await fetch(
          `/api/admin/integrations/meta/instagram/publish?org_id=${orgId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrl, caption: post.bio }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? 'Échec de la publication');
        }
        await fetchMedia();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de la publication');
      } finally {
        setPublishingPostId(null);
      }
    },
    [orgId, fetchMedia]
  );

  const postsWithVisuals = (event.comWorkflow?.posts ?? []).filter(
    (p) => p.visuals?.length && p.visuals[0]?.url
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-500">Chargement des posts Instagram...</p>
      </div>
    );
  }

  if (error && media.length === 0) {
    const errObj = typeof error === 'object' && error !== null ? error : null;
    const reason = errObj?.reason;
    const details = errObj?.details;
    const isTransient = errObj?.isTransient;
    const title =
      isTransient
        ? 'Erreur temporaire côté Instagram'
        : reason === 'no_credentials'
          ? 'Meta non connecté pour cette organisation'
          : reason === 'api_error' && details?.includes('Token expiré')
            ? 'Token Instagram expiré'
            : 'Instagram non connecté';
    const description =
      reason === 'no_credentials'
        ? 'Connectez Meta dans les paramètres d\'intégration pour cette organisation.'
        : details ?? (typeof error === 'string' ? error : errObj?.message ?? 'Erreur inconnue');
    return (
      <EmptyState
        icon={Instagram}
        title={title}
        description={description}
        action={
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
            {isTransient ? (
              <>
                <Button variant="primary" size="sm" onClick={() => fetchMedia()} className="inline-flex items-center gap-1.5">
                  <RefreshCw size={14} />
                  Réessayer
                </Button>
                <Link href="/dashboard/admin/integration">
                  <Button variant="outline" size="sm">
                    Reconnecter Meta
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard/admin/integration">
                <Button variant="primary" size="sm">
                  Configurer Meta (Administration)
                </Button>
              </Link>
            )}
            {orgId && process.env.NODE_ENV === 'development' && (
              <a
                href={`/api/admin/integrations/meta/debug?org_id=${orgId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                Diagnostiquer
              </a>
            )}
          </div>
        }
      />
    );
  }

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques du compte */}
      {accountStats && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 p-4">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Statistiques du compte
            {accountStats.account?.username && (
              <span className="text-zinc-500 font-normal ml-2">
                @{accountStats.account.username}
              </span>
            )}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {accountStats.account?.followers_count != null && (
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                  <Users size={18} className="text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatNumber(accountStats.account.followers_count)}
                  </p>
                  <p className="text-xs text-zinc-500">Abonnés</p>
                </div>
              </div>
            )}
            {accountStats.account?.media_count != null && (
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Image size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {accountStats.account.media_count}
                  </p>
                  <p className="text-xs text-zinc-500">Publications</p>
                </div>
              </div>
            )}
            {accountStats.insights?.reach != null && (
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Eye size={18} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatNumber(accountStats.insights.reach)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Portée (7 jours)
                  </p>
                </div>
              </div>
            )}
            {accountStats.insights?.accounts_engaged != null && (
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <TrendingUp size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatNumber(accountStats.insights.accounts_engaged)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Engagés (7 jours)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Posts Instagram
        </h3>
        <Button variant="outline" size="sm" onClick={fetchMedia} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </Button>
      </div>

      {media.length === 0 ? (
        <EmptyState
          icon={Instagram}
          title="Aucun post Instagram"
          description="Vos posts publiés sur Instagram apparaîtront ici."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((m) => (
            <Card key={m.id} className="overflow-hidden">
              {m.media_url && (
                <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative">
                  {m.media_type === 'VIDEO' ? (
                    <video
                      src={m.media_url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={m.media_url}
                      alt={m.caption ?? 'Post Instagram'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
              <CardContent className="p-3">
                {m.caption && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                    {m.caption}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Heart size={12} />
                    {m.like_count ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} />
                    {m.comments_count ?? 0}
                  </span>
                  {m.insights?.reach != null && (
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {m.insights.reach}
                    </span>
                  )}
                </div>
                {m.timestamp && (
                  <p className="text-[10px] text-zinc-400 mt-1">
                    {format(new Date(m.timestamp), 'd MMM yyyy', { locale: fr })}
                  </p>
                )}
                {m.permalink && (
                  <a
                    href={m.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400 mt-2 hover:underline"
                  >
                    <ExternalLink size={12} />
                    Voir sur Instagram
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {postsWithVisuals.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Publier un post de la campagne
          </h3>
          <div className="space-y-2">
            {postsWithVisuals.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
              >
                {post.visuals?.[0]?.url && (
                  <img
                    src={post.visuals[0].url}
                    alt={post.name}
                    className="w-12 h-12 rounded object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.name}</p>
                  {post.bio && (
                    <p className="text-xs text-zinc-500 line-clamp-1">{post.bio}</p>
                  )}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handlePublishPost(post)}
                  disabled={!!publishingPostId}
                >
                  {publishingPostId === post.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      Publier
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
