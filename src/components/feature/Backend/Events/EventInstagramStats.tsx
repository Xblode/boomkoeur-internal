'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEventDetail } from './EventDetailProvider';
import { useOrg } from '@/hooks';
import type { ComWorkflowPost, Event } from '@/types/event';
import { Button } from '@/components/ui/atoms';
import { EmptyState, Card, CardContent } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';
import { CHART_SERIES_COLORS, CHART_UI_COLORS } from '@/lib/constants/chart-colors';
import {
  RefreshCw,
  Loader2,
  Instagram,
  Users,
  Eye,
  TrendingUp,
  Image,
  Link2,
} from 'lucide-react';
import Link from 'next/link';
import { Modal, ModalContent, ModalFooter, ModalTwoColumnLayout } from '@/components/ui';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/atoms';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface MediaInsights {
  reach?: number;
  impressions?: number;
  engagement?: number;
  likes?: number;
  comments?: number;
  saved?: number;
  shares?: number;
  views?: number;
}

interface CampaignPostWithStats extends ComWorkflowPost {
  media?: {
    like_count?: number;
    comments_count?: number;
    permalink?: string;
    media_type?: string;
  };
  insights?: MediaInsights;
}

interface EventInstagramStatsProps {
  metaConnected?: boolean;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card variant="outline">
      <CardContent className="p-4 space-y-1">
        <div className="flex items-center gap-2 text-zinc-500">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="text-xl font-bold tabular-nums">{value}</p>
        {sub && <p className="text-[11px] text-zinc-400">{sub}</p>}
      </CardContent>
    </Card>
  );
}

interface InstagramMediaItem {
  id: string;
  media_type: string;
  media_url?: string;
  permalink?: string;
  caption?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

export function EventInstagramStats({ metaConnected = false }: EventInstagramStatsProps) {
  const { event, persistField } = useEventDetail();
  const { activeOrg } = useOrg();
  const orgId = event.orgId ?? activeOrg?.id;

  const [accountStats, setAccountStats] = useState<{
    account?: { username?: string; followers_count?: number };
    insights?: { reach?: number; impressions?: number };
    period_days?: number;
  } | null>(null);
  const [insightsDaily, setInsightsDaily] = useState<
    { date: string; label: string; reach: number; impressions: number }[]
  >([]);
  const [campaignPostsWithStats, setCampaignPostsWithStats] = useState<
    CampaignPostWithStats[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<
    string | { message: string; reason?: string; details?: string; isTransient?: boolean } | null
  >(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [igMediaList, setIgMediaList] = useState<InstagramMediaItem[]>([]);
  const [linkModalLoading, setLinkModalLoading] = useState(false);
  const [linkSelectedCampaign, setLinkSelectedCampaign] = useState<string | null>(null);
  const [linkSelectedIg, setLinkSelectedIg] = useState<string | null>(null);
  const [linkLinking, setLinkLinking] = useState(false);

  const campaignPosts = (event.comWorkflow?.posts ?? []).filter(
    (p): p is ComWorkflowPost & { ig_media_id: string } =>
      !!p.ig_media_id
  );

  const campaignPostsUnlinked = (event.comWorkflow?.posts ?? []).filter(
    (p) => !p.ig_media_id
  );

  const linkedIgIds = new Set(
    (event.comWorkflow?.posts ?? [])
      .map((p) => p.ig_media_id)
      .filter(Boolean) as string[]
  );

  const fetchIgMediaForLink = useCallback(async () => {
    if (!orgId) return;
    setLinkModalLoading(true);
    try {
      const res = await fetch(
        `/api/admin/integrations/meta/instagram/media?org_id=${orgId}&limit=50`
      );
      const data = await res.json();
      if (res.ok && data.data) {
        setIgMediaList(data.data);
      } else {
        setIgMediaList([]);
      }
    } catch {
      setIgMediaList([]);
    } finally {
      setLinkModalLoading(false);
    }
  }, [orgId]);

  const handleOpenLinkModal = useCallback(() => {
    setLinkModalOpen(true);
    setLinkSelectedCampaign(null);
    setLinkSelectedIg(null);
    fetchIgMediaForLink();
  }, [fetchIgMediaForLink]);

  const fetchData = useCallback(
    async () => {
      if (!orgId) {
        setLoading(false);
        setError('Organisation non définie');
        return;
      }
      if (!metaConnected) {
        setLoading(false);
        setError({ message: 'Meta non connecté', reason: 'no_credentials' });
        setAccountStats(null);
        setInsightsDaily([]);
        setCampaignPostsWithStats([]);
        return;
      }

      setLoading(true);
      setError(null);

      const postsToFetch = (event.comWorkflow?.posts ?? []).filter(
        (p): p is ComWorkflowPost & { ig_media_id: string } => !!p.ig_media_id
      );

      try {
        const [accountRes, dailyRes] = await Promise.all([
          fetch(`/api/admin/integrations/meta/instagram/account/insights?org_id=${orgId}&period=7`),
          fetch(
            `/api/admin/integrations/meta/instagram/account/insights?org_id=${orgId}&format=daily&period=28`
          ),
        ]);

        const accountData = await accountRes.json();
        const dailyData = await dailyRes.json();

        if (!accountRes.ok) {
          const err = accountData;
          throw Object.assign(new Error(err.error ?? 'Erreur chargement compte'), {
            reason: err.reason,
            details: err.details,
            isTransient: err.isTransient,
          });
        }

        setAccountStats(accountData);
        setInsightsDaily(dailyData.data ?? []);

        if (postsToFetch.length > 0) {
          const postsWithStats = await Promise.all(
            postsToFetch.map(async (post) => {
              const mediaRes = await fetch(
                `/api/admin/integrations/meta/instagram/media/${post.ig_media_id}?org_id=${orgId}`
              );
              const media = mediaRes.ok ? await mediaRes.json() : null;
              const mediaType = media?.media_product_type ?? media?.media_type ?? undefined;
              const insightsRes = await fetch(
                `/api/admin/integrations/meta/instagram/media/${post.ig_media_id}/insights?org_id=${orgId}${mediaType ? `&media_type=${encodeURIComponent(mediaType)}` : ''}`
              );
              const insights = insightsRes.ok ? await insightsRes.json() : null;

              return {
                ...post,
                media: media
                  ? {
                      like_count: media.like_count,
                      comments_count: media.comments_count,
                      permalink: media.permalink,
                      media_type: media.media_product_type ?? media.media_type,
                    }
                  : undefined,
                insights: insights ?? undefined,
              } as CampaignPostWithStats;
            })
          );
          setCampaignPostsWithStats(postsWithStats);
        } else {
          setCampaignPostsWithStats([]);
        }

        setLastSync(new Date());
      } catch (err) {
        const e = err as Error & { reason?: string; details?: string; isTransient?: boolean };
        setError({
          message: e.message,
          reason: e.reason,
          details: e.details,
          isTransient: e.isTransient,
        });
        setAccountStats(null);
        setInsightsDaily([]);
        setCampaignPostsWithStats([]);
      } finally {
        setLoading(false);
      }
    },
    [orgId, metaConnected, event.comWorkflow?.posts]
  );

  const handleLinkPost = useCallback(async () => {
    if (!linkSelectedCampaign || !linkSelectedIg || !orgId) return;
    setLinkLinking(true);
    try {
      const currentPosts = event.comWorkflow?.posts ?? [];
      const isFirstLink = !currentPosts.some((p) => p.ig_media_id);
      let followersAtStart: number | undefined;
      if (isFirstLink) {
        try {
          const accRes = await fetch(
            `/api/admin/integrations/meta/instagram/account/insights?org_id=${orgId}&period=7`
          );
          const accData = await accRes.json();
          followersAtStart = accData.account?.followers_count;
        } catch {
          // Ignore
        }
      }

      await persistField((current) => {
        const posts = (current.comWorkflow?.posts ?? []).map((p) =>
          p.id === linkSelectedCampaign ? { ...p, ig_media_id: linkSelectedIg } : p
        );
        const wf: NonNullable<Event['comWorkflow']> = {
          ...current.comWorkflow!,
          posts,
        };
        if (isFirstLink && followersAtStart != null) {
          wf.followers_count_at_campaign_start = followersAtStart;
          wf.campaign_started_at = new Date().toISOString();
        }
        return { comWorkflow: wf };
      });
      toast.success('Post lié avec succès');
      setLinkModalOpen(false);
      fetchData();
    } catch {
      toast.error('Erreur lors de la liaison');
    } finally {
      setLinkLinking(false);
    }
  }, [linkSelectedCampaign, linkSelectedIg, orgId, event.comWorkflow?.posts, persistField, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const wf = event.comWorkflow;
  const followersAtStart = wf?.followers_count_at_campaign_start;
  const campaignStartedAt = wf?.campaign_started_at;
  const currentFollowers = accountStats?.account?.followers_count ?? 0;
  const impactDelta =
    followersAtStart != null && currentFollowers > 0
      ? currentFollowers - followersAtStart
      : null;

  const accountReach = accountStats?.insights?.reach ?? 0;
  const campaignReachSum = campaignPostsWithStats.reduce(
    (acc, p) => acc + (p.insights?.reach ?? p.insights?.impressions ?? 0),
    0
  );
  const displayReach =
    accountReach > 0 ? accountReach : campaignReachSum > 0 ? campaignReachSum : 0;
  const reachLabel =
    accountReach > 0 ? 'Portée 7j' : campaignReachSum > 0 ? 'Portée campagne' : 'Portée 7j';

  if (loading && !accountStats) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
        <p className="text-sm text-zinc-500">Chargement des statistiques Instagram...</p>
      </div>
    );
  }

  if (error && !accountStats) {
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
        ? "Connectez Meta dans les paramètres d'intégration pour cette organisation."
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
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => fetchData()}
                  className="inline-flex items-center gap-1.5"
                >
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

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-400">
          {lastSync && (
            <>Dernière synchro : {format(lastSync, "d MMM 'à' HH:mm", { locale: fr })}</>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenLinkModal}
            disabled={!metaConnected || campaignPostsUnlinked.length === 0}
            title={
              campaignPostsUnlinked.length === 0
                ? 'Tous les posts sont déjà liés'
                : 'Lier un post Instagram à un post de campagne'
            }
          >
            <Link2 size={14} />
            Lier un post
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData()}
            disabled={loading}
          >
            <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Modal Lier un post */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Lier un post Instagram à la campagne"
        size="lg"
        variant="fullBleed"
      >
        <ModalTwoColumnLayout
          leftWidth="14rem"
          minHeight="360px"
          left={
            <div className="p-3 space-y-1">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                Post campagne (sans lien)
              </p>
              {campaignPostsUnlinked.length === 0 ? (
                <p className="text-xs text-zinc-500">Aucun post à lier</p>
              ) : (
                campaignPostsUnlinked.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setLinkSelectedCampaign(p.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      linkSelectedCampaign === p.id
                        ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    )}
                  >
                    <span className="truncate block">{p.name}</span>
                    <span className="text-[10px] text-zinc-500">
                      {p.type === 'reel' ? 'Reel' : p.type === 'story' ? 'Story' : 'Post'}
                    </span>
                  </button>
                ))
              )}
            </div>
          }
          right={
            <div className="p-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                Post Instagram (compte)
              </p>
              {linkModalLoading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-sm text-zinc-500">
                  <Loader2 size={16} className="animate-spin" />
                  Chargement...
                </div>
              ) : igMediaList.length === 0 ? (
                <p className="text-sm text-zinc-500 py-4">Aucun post Instagram trouvé</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[320px] overflow-y-auto">
                  {igMediaList.map((m) => {
                    const alreadyLinked = linkedIgIds.has(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => !alreadyLinked && setLinkSelectedIg(m.id)}
                        disabled={alreadyLinked}
                        className={cn(
                          'relative rounded-lg overflow-hidden border-2 transition-all aspect-square',
                          linkSelectedIg === m.id
                            ? 'border-pink-500 ring-2 ring-pink-500/30'
                            : alreadyLinked
                              ? 'border-zinc-200 dark:border-zinc-700 opacity-50 cursor-not-allowed'
                              : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                        )}
                      >
                        {m.media_url ? (
                          <img
                            src={m.media_url}
                            alt={m.caption ?? ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            <Image size={24} className="text-zinc-400" />
                          </div>
                        )}
                        {alreadyLinked && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-[10px] text-white font-medium">Lié</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          }
        />
        <ModalFooter>
          <Button variant="ghost" size="sm" onClick={() => setLinkModalOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleLinkPost}
            disabled={!linkSelectedCampaign || !linkSelectedIg || linkLinking}
          >
            {linkLinking ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <>
                <Link2 size={14} />
                Lier
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Users size={18} />}
          label="Abonnés"
          value={formatNumber(accountStats?.account?.followers_count ?? 0)}
          sub={accountStats?.account?.username ? `@${accountStats.account.username}` : undefined}
        />
        <KpiCard
          icon={<TrendingUp size={18} />}
          label="Impact campagne"
          value={
            impactDelta != null
              ? `${impactDelta >= 0 ? '+' : ''}${impactDelta}`
              : campaignPosts.length > 0
                ? '—'
                : '—'
          }
          sub={
            campaignPosts.length > 0
              ? campaignStartedAt
                ? `Depuis ${format(new Date(campaignStartedAt), 'd MMM', { locale: fr })}`
                : 'Campagne en cours'
              : 'Aucune campagne en cours'
          }
        />
        <KpiCard
          icon={<Eye size={18} />}
          label={reachLabel}
          value={formatNumber(displayReach)}
          sub={campaignReachSum > 0 && accountReach === 0 ? 'Somme des posts campagne' : undefined}
        />
        <KpiCard
          icon={<Image size={18} />}
          label="Posts campagne"
          value={String(campaignPosts.length)}
          sub={campaignPosts.length > 0 ? 'liés ou publiés' : undefined}
        />
      </div>

      {/* Impact campagne */}
      {campaignStartedAt && followersAtStart != null && (
        <Card variant="outline">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-3">Impact de la campagne</h4>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Abonnés au début : <strong className="text-zinc-900 dark:text-zinc-100">{formatNumber(followersAtStart)}</strong>
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                Abonnés actuels : <strong className="text-zinc-900 dark:text-zinc-100">{formatNumber(currentFollowers)}</strong>
              </span>
              {impactDelta != null && (
                <span
                  className={cn(
                    'font-medium',
                    impactDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {impactDelta >= 0 ? '+' : ''}{impactDelta} abonnés
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graphique Évolution */}
      {insightsDaily.length >= 1 && (
        <Card variant="outline">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-4">Évolution (portée et impressions)</h4>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={insightsDaily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="igReachGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_SERIES_COLORS.balanceChart} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_SERIES_COLORS.balanceChart} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="igImpressionsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_SERIES_COLORS.revenue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_SERIES_COLORS.revenue} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_UI_COLORS.gridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: CHART_UI_COLORS.tickFill }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: CHART_UI_COLORS.tickFill }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: `1px solid ${CHART_UI_COLORS.tooltipBorder}`,
                    fontSize: '12px',
                    backgroundColor: CHART_UI_COLORS.tooltipBg,
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={((value: number, name: string) => {
                    const v = value ?? 0;
                    if (name === 'reach') return [formatNumber(v), 'Portée'];
                    return [formatNumber(v), 'Impressions'];
                  }) as any}
                />
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke={CHART_SERIES_COLORS.balanceChart}
                  strokeWidth={2.5}
                  fill="url(#igReachGradient)"
                  dot={{ r: 4, fill: CHART_SERIES_COLORS.balanceChart, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: CHART_SERIES_COLORS.balanceChart, strokeWidth: 0 }}
                  isAnimationActive={true}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke={CHART_SERIES_COLORS.revenue}
                  strokeWidth={2.5}
                  fill="url(#igImpressionsGradient)"
                  dot={{ r: 4, fill: CHART_SERIES_COLORS.revenue, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: CHART_SERIES_COLORS.revenue, strokeWidth: 0 }}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Stats par post campagne */}
      <Card variant="outline">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-3">Stats par post de campagne</h4>
          <p className="text-xs text-zinc-500 mb-4">
            Suivi et analyse des performances par post (reach, vues, engagement, sauvegardes, partages).
          </p>
          {campaignPostsWithStats.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Aucun post de campagne lié. Liez des posts Instagram ou publiez depuis le site pour
              afficher les statistiques.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table
                variant="default"
                resizable={false}
                statusColumn={false}
                fillColumn={false}
              >
                <TableHeader>
                  <TableRow hoverCellOnly>
                    <TableHead minWidth={140} defaultWidth={200}>
                      Post
                    </TableHead>
                    <TableHead align="right" minWidth={80} defaultWidth={100}>
                      Vues
                    </TableHead>
                    <TableHead align="right" minWidth={80} defaultWidth={100}>
                      Portée
                    </TableHead>
                    <TableHead align="right" minWidth={70} defaultWidth={90}>
                      Likes
                    </TableHead>
                    <TableHead align="right" minWidth={70} defaultWidth={90}>
                      Com.
                    </TableHead>
                    <TableHead align="right" minWidth={70} defaultWidth={90}>
                      Eng.
                    </TableHead>
                    <TableHead align="right" minWidth={60} defaultWidth={80}>
                      Sauv.
                    </TableHead>
                    <TableHead align="right" minWidth={60} defaultWidth={80}>
                      Part.
                    </TableHead>
                    <TableHead align="right" minWidth={80} defaultWidth={100} className="text-right">
                      Taux eng.
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignPostsWithStats.map((post) => {
                    const impressions =
                      post.insights?.impressions ?? post.insights?.views ?? 0;
                    const reach = post.insights?.reach ?? 0;
                    const likes = post.insights?.likes ?? post.media?.like_count ?? 0;
                    const comments =
                      post.insights?.comments ?? post.media?.comments_count ?? 0;
                    const engagement = post.insights?.engagement ?? 0;
                    const saved = post.insights?.saved ?? 0;
                    const shares = post.insights?.shares ?? 0;
                    const totalInteractions = likes + comments + saved + shares;
                    const engagementRate =
                      reach > 0
                        ? ((totalInteractions / reach) * 100).toFixed(1)
                        : impressions > 0
                          ? ((totalInteractions / impressions) * 100).toFixed(1)
                          : '—';
                    const postLabel =
                      post.type === 'reel'
                        ? 'Reel'
                        : post.type === 'story'
                          ? 'Story'
                          : 'Post';
                    return (
                      <TableRow key={post.id} hoverCellOnly>
                        <TableCell noHoverBorder>
                          <div>
                            {post.media?.permalink ? (
                              <a
                                href={post.media.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-pink-600 dark:text-pink-400 hover:underline truncate block"
                              >
                                {post.name}
                              </a>
                            ) : (
                              <p className="text-sm font-medium truncate">
                                {post.name}
                              </p>
                            )}
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              {postLabel}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell noHoverBorder align="right" className="tabular-nums text-sm text-zinc-700 dark:text-zinc-300">
                          {impressions > 0 ? formatNumber(impressions) : '—'}
                        </TableCell>
                        <TableCell noHoverBorder align="right" className="tabular-nums text-sm text-zinc-700 dark:text-zinc-300">
                          {reach > 0 ? formatNumber(reach) : '—'}
                        </TableCell>
                        <TableCell noHoverBorder align="right" className="tabular-nums text-sm text-zinc-700 dark:text-zinc-300">
                          {likes > 0 ? formatNumber(likes) : '—'}
                        </TableCell>
                        <TableCell noHoverBorder align="right" className="tabular-nums text-sm text-zinc-700 dark:text-zinc-300">
                          {comments > 0 ? formatNumber(comments) : '—'}
                        </TableCell>
                        <TableCell noHoverBorder align="right" className="tabular-nums text-sm text-zinc-700 dark:text-zinc-300">
                          {engagement > 0 ? formatNumber(engagement) : '—'}
                        </TableCell>
                        <TableCell noHoverBorder align="right" className="tabular-nums text-sm text-zinc-700 dark:text-zinc-300">
                          {saved > 0 ? formatNumber(saved) : '—'}
                        </TableCell>
                        <TableCell noHoverBorder align="right" className="tabular-nums text-sm text-zinc-700 dark:text-zinc-300">
                          {shares > 0 ? formatNumber(shares) : '—'}
                        </TableCell>
                        <TableCell noHoverBorder align="right" className="tabular-nums text-sm text-zinc-700 dark:text-zinc-300">
                          <span className="block w-full text-right">
                            {engagementRate}
                            {engagementRate !== '—' ? '%' : ''}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
