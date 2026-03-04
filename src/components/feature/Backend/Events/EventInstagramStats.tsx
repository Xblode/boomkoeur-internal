'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEventDetail } from './EventDetailProvider';
import { useOrg } from '@/hooks';
import type { ComWorkflowPost } from '@/types/event';
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
  ExternalLink,
  TrendingUp,
  Image,
  Heart,
} from 'lucide-react';
import Link from 'next/link';
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

export function EventInstagramStats({ metaConnected = false }: EventInstagramStatsProps) {
  const { event } = useEventDetail();
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

  const campaignPosts = (event.comWorkflow?.posts ?? []).filter(
    (p): p is ComWorkflowPost & { ig_media_id: string } =>
      !!p.ig_media_id
  );

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
              const [mediaRes, insightsRes] = await Promise.all([
                fetch(
                  `/api/admin/integrations/meta/instagram/media/${post.ig_media_id}?org_id=${orgId}`
                ),
                fetch(
                  `/api/admin/integrations/meta/instagram/media/${post.ig_media_id}/insights?org_id=${orgId}`
                ),
              ]);

              const media = mediaRes.ok ? await mediaRes.json() : null;
              const insights = insightsRes.ok ? await insightsRes.json() : null;

              return {
                ...post,
                media: media
                  ? {
                      like_count: media.like_count,
                      comments_count: media.comments_count,
                      permalink: media.permalink,
                      media_type: media.media_type,
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
              : '—'
          }
          sub={
            campaignStartedAt
              ? `Depuis ${format(new Date(campaignStartedAt), 'd MMM', { locale: fr })}`
              : 'Aucune campagne en cours'
          }
        />
        <KpiCard
          icon={<Eye size={18} />}
          label="Portée 7j"
          value={formatNumber(accountStats?.insights?.reach ?? 0)}
        />
        <KpiCard
          icon={<Image size={18} />}
          label="Posts campagne"
          value={String(campaignPosts.length)}
          sub={`publiés via le site`}
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
          {campaignPostsWithStats.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Aucun post de campagne publié via le site. Les posts publiés depuis ici apparaîtront
              avec leurs statistiques.
            </p>
          ) : (
            <div className="space-y-3">
              {campaignPostsWithStats.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-wrap items-center gap-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{post.name}</p>
                    <p className="text-xs text-zinc-500">
                      {post.type === 'reel' ? 'Reel' : post.type === 'story' ? 'Story' : 'Post'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                    {post.insights?.impressions != null && (
                      <span title="Vues">
                        <Eye size={12} className="inline mr-1" />
                        {formatNumber(post.insights.impressions)} vues
                      </span>
                    )}
                    {post.insights?.reach != null && (
                      <span title="Portée">
                        <TrendingUp size={12} className="inline mr-1" />
                        {formatNumber(post.insights.reach)} portée
                      </span>
                    )}
                    {post.media?.like_count != null && (
                      <span title="Likes">
                        <Heart size={12} className="inline mr-1" />
                        {formatNumber(post.media.like_count)}
                      </span>
                    )}
                    {post.media?.comments_count != null && (
                      <span title="Commentaires">{formatNumber(post.media.comments_count)} com.</span>
                    )}
                    {post.insights?.engagement != null && (
                      <span title="Engagement">{formatNumber(post.insights.engagement)} eng.</span>
                    )}
                  </div>
                  {post.media?.permalink && (
                    <a
                      href={post.media.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-pink-600 dark:text-pink-400 hover:underline shrink-0"
                    >
                      <ExternalLink size={12} />
                      Instagram
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
