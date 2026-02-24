'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight, ChevronsUpDown, Building2, Check, Search,
  LayoutDashboard, FileText, Settings, User, Shield,
  Calendar, MessageSquare, Palette,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { backendNavigation, footerLinks, frontendNavigation } from '@/config/navigation';
import { getEventById } from '@/lib/supabase/events';
import { getMeetingById } from '@/lib/supabase/meetings';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/atoms';
import { useOrg } from '@/hooks';

export interface BreadcrumbProps {
  ignore?: string[];
  className?: string;
  customLabels?: Record<string, string>;
  variant?: 'default' | 'navigation';
}

function humanizeSegment(seg: string): string {
  let displaySeg = seg;
  const idCodePattern = /-[a-z0-9]{5}$/;
  if (idCodePattern.test(seg)) {
    displaySeg = seg.replace(idCodePattern, '');
  }
  const cleaned = displaySeg.replace(/[-_]/g, ' ').trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

const SEGMENT_LABELS: Record<string, string> = {
  campagne: 'Campagne',
  artistes: 'Artistes',
  planning: 'Planning',
  'elements-lies': 'Éléments liés',
  billetterie: 'Billetterie',
  securite: 'Sécurité',
  informations: 'Informations',
  apparence: 'Apparence',
  notifications: 'Notifications',
  general: 'Général',
  utilisateurs: 'Utilisateurs',
  integration: 'Intégration',
  statistiques: 'Statistiques',
  stock: 'Stock',
  variantes: 'Variantes',
  commandes: 'Commandes',
  'compte-rendu': 'Compte-rendu',
  new: 'Nouveau',
  present: 'Présentation',
};

function buildHrefLabelMap(): Record<string, string> {
  const map: Record<string, string> = {};
  const add = (href: string, label: string) => {
    const key = href !== '/' ? href.replace(/\/+$/, '') : '/';
    map[key] = label;
  };
  frontendNavigation.forEach(item => add(item.href, item.label));
  footerLinks.forEach(item => add(item.href, item.label));
  backendNavigation.forEach(item => add(item.href, item.label));
  return map;
}

// ─── Section mapping for navigation variant ─────────────────────────────────

function buildSectionMap(): Record<string, { label: string; icon: LucideIcon }> {
  const map: Record<string, { label: string; icon: LucideIcon }> = {};
  backendNavigation.forEach(item => {
    const seg = item.href.replace('/dashboard/', '').replace('/dashboard', '');
    if (seg) {
      map[seg] = { label: item.label, icon: item.icon as LucideIcon };
    }
  });
  if (!map['settings']) map['settings'] = { label: 'Paramètres', icon: Settings };
  if (!map['profile']) map['profile'] = { label: 'Profil', icon: User };
  if (!map['admin']) map['admin'] = { label: 'Administration', icon: Shield };
  if (!map['calendar']) map['calendar'] = { label: 'Calendrier', icon: Calendar };
  if (!map['communication']) map['communication'] = { label: 'Communication', icon: MessageSquare };
  if (!map['design-system']) map['design-system'] = { label: 'Design System', icon: Palette };
  return map;
}

const SECTION_MAP = buildSectionMap();

// ─── Navigation variant ─────────────────────────────────────────────────────

function NavigationBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname() ?? '/';
  const { activeOrg, userOrgs, switchOrg, isLoading } = useOrg();
  const [orgSearch, setOrgSearch] = useState('');
  const [orgPopoverOpen, setOrgPopoverOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [eventNameMap, setEventNameMap] = useState<Record<string, string>>({});
  const [meetingNameMap, setMeetingNameMap] = useState<Record<string, string>>({});

  React.useEffect(() => { setMounted(true); }, []);

  const segments = React.useMemo(
    () => pathname.split('/').filter(Boolean),
    [pathname],
  );

  React.useEffect(() => {
    const eventsIdx = segments.indexOf('events');
    if (eventsIdx !== -1 && segments[eventsIdx + 1] && segments[eventsIdx + 1] !== 'new') {
      const eventId = segments[eventsIdx + 1];
      const href = '/' + segments.slice(0, eventsIdx + 2).join('/');
      if (!eventNameMap[href]) {
        getEventById(eventId)
          .then((event) => {
            if (event) setEventNameMap((prev) => ({ ...prev, [href]: event.name }));
          })
          .catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  React.useEffect(() => {
    const meetingsIdx = segments.indexOf('meetings');
    if (meetingsIdx !== -1 && segments[meetingsIdx + 1]) {
      const meetingId = segments[meetingsIdx + 1];
      const href = '/' + segments.slice(0, meetingsIdx + 2).join('/');
      if (!meetingNameMap[href]) {
        getMeetingById(meetingId)
          .then((meeting) => {
            if (meeting) setMeetingNameMap((prev) => ({ ...prev, [href]: meeting.title }));
          })
          .catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  // ── Page section ────────────────────────────────────────────────────────
  const sectionSlug = segments[1] ?? null;
  let pageLabel: string;
  let PageIcon: LucideIcon;
  let pageHref: string;

  if (!sectionSlug) {
    pageLabel = 'Dashboard';
    PageIcon = LayoutDashboard;
    pageHref = '/dashboard';
  } else {
    const info = SECTION_MAP[sectionSlug];
    pageLabel = info?.label ?? humanizeSegment(sectionSlug);
    PageIcon = info?.icon ?? LayoutDashboard;
    pageHref = `/dashboard/${sectionSlug}`;
  }

  // ── Location parts (event/meeting name + sub-page) ────────────────────────
  type LocationPart = { label: string; href?: string };
  const locationParts: LocationPart[] = [];
  const remaining = segments.slice(2);

  const eventsIdx = segments.indexOf('events');
  const meetingsIdx = segments.indexOf('meetings');

  // Event detail: /dashboard/events/eventId ou /dashboard/events/eventId/campagne
  if (eventsIdx !== -1 && segments[eventsIdx + 1] && segments[eventsIdx + 1] !== 'new') {
    const eventId = segments[eventsIdx + 1];
    const eventHref = '/' + segments.slice(0, eventsIdx + 2).join('/');
    const eventName = mounted ? eventNameMap[eventHref] : null;
    locationParts.push({ label: eventName ?? '...', href: eventHref });
    if (segments.length > eventsIdx + 2) {
      const subSeg = segments[eventsIdx + 2];
      const subLabel = SEGMENT_LABELS[subSeg] ?? humanizeSegment(subSeg);
      locationParts.push({ label: subLabel });
    }
  }
  // Meeting detail: /dashboard/meetings/meetingId ou /dashboard/meetings/meetingId/compte-rendu
  else if (meetingsIdx !== -1 && segments[meetingsIdx + 1]) {
    const meetingId = segments[meetingsIdx + 1];
    const meetingHref = '/' + segments.slice(0, meetingsIdx + 2).join('/');
    const meetingName = mounted ? meetingNameMap[meetingHref] : null;
    locationParts.push({ label: meetingName ?? '...', href: meetingHref });
    if (segments.length > meetingsIdx + 2) {
      const subSeg = segments[meetingsIdx + 2];
      const subLabel = SEGMENT_LABELS[subSeg] ?? humanizeSegment(subSeg);
      locationParts.push({ label: subLabel });
    }
  }
  // Autres pages (products, etc.)
  else if (remaining.length > 0) {
    const lastSeg = remaining[remaining.length - 1];
    if (SEGMENT_LABELS[lastSeg]) {
      locationParts.push({ label: SEGMENT_LABELS[lastSeg] });
    } else {
      const isId = /^[0-9a-f]{8,}(-[0-9a-f]{4,}){0,4}$/i.test(lastSeg) || lastSeg.length > 20;
      if (isId) {
        const href = '/' + segments.slice(0, segments.indexOf(lastSeg) + 1).join('/');
        locationParts.push({ label: (mounted ? eventNameMap[href] : null) ?? humanizeSegment(lastSeg) });
      } else {
        locationParts.push({ label: humanizeSegment(lastSeg) });
      }
    }
  }

  const hasLocation = locationParts.length > 0;

  // ── Org popover ─────────────────────────────────────────────────────────
  const filteredOrgs = userOrgs.filter(org =>
    org.name.toLowerCase().includes(orgSearch.toLowerCase()),
  );

  const handleSwitchOrg = (orgId: string) => {
    switchOrg(orgId);
    setOrgPopoverOpen(false);
    setOrgSearch('');
  };

  const segCls = 'flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300';
  const hoverCls = 'hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-md px-1.5 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800';
  const staticCls = 'px-1.5 py-1';

  return (
    <nav aria-label="Navigation" className={cn('flex items-center min-w-0', className)}>
      <ol className="flex items-center gap-0.5">
        {/* ── Organisation ── */}
        <li className="shrink-0">
          <Popover
            open={orgPopoverOpen}
            onOpenChange={(open) => { setOrgPopoverOpen(open); if (!open) setOrgSearch(''); }}
          >
            <PopoverTrigger asChild>
              <button type="button" className={cn(segCls, hoverCls)}>
                <Building2 size={16} className="shrink-0" />
                <span className="truncate max-w-[160px]">
                  {isLoading ? '...' : (activeOrg?.name ?? 'Organisation')}
                </span>
                <ChevronsUpDown size={14} className="opacity-50 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start" sideOffset={8}>
              <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    value={orgSearch}
                    onChange={(e) => setOrgSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto p-1" role="listbox" aria-label="Organisations">
                {filteredOrgs.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-3">Aucune organisation</p>
                ) : (
                  filteredOrgs.map(org => (
                    <button
                      key={org.id}
                      type="button"
                      role="option"
                      aria-selected={org.id === activeOrg?.id}
                      onClick={() => handleSwitchOrg(org.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors text-left',
                        org.id === activeOrg?.id
                          ? 'bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                      )}
                    >
                      <Building2 size={14} className="shrink-0 text-zinc-400" />
                      <span className="truncate flex-1">{org.name}</span>
                      {org.id === activeOrg?.id && <Check size={14} className="shrink-0 text-zinc-500" />}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </li>

        {/* ── Separator + Page ── (masqués sur mobile : on n'affiche que l'organisation) */}
        <li className="hidden lg:flex text-zinc-400 dark:text-zinc-600 select-none shrink-0 text-sm">/</li>
        <li className="hidden lg:flex shrink-0">
          {hasLocation ? (
            <Link href={pageHref} className={cn(segCls, hoverCls)}>
              <PageIcon size={16} className="shrink-0" />
              <span>{pageLabel}</span>
            </Link>
          ) : (
            <span className={cn(segCls, staticCls)}>
              <PageIcon size={16} className="shrink-0" />
              <span>{pageLabel}</span>
            </span>
          )}
        </li>

        {/* ── Separator + Location parts ── (masqués sur mobile) */}
        {locationParts.map((part, i) => (
          <React.Fragment key={i}>
            <li className="hidden lg:flex text-zinc-400 dark:text-zinc-600 select-none shrink-0 text-sm">/</li>
            <li className="hidden lg:flex shrink-0 min-w-0">
              {part.href ? (
                <Link href={part.href} className={cn(segCls, hoverCls)}>
                  <FileText size={16} className="shrink-0" />
                  <span className="truncate max-w-[200px]">{part.label}</span>
                </Link>
              ) : (
                <span className={cn(segCls, staticCls)}>
                  <FileText size={16} className="shrink-0" />
                  <span className="truncate max-w-[200px]">{part.label}</span>
                </span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}

// ─── Default variant (existing breadcrumb) ──────────────────────────────────

function DefaultBreadcrumb({
  ignore = [],
  className,
  customLabels = {},
}: Omit<BreadcrumbProps, 'variant'>) {
  const pathname = usePathname() ?? '/';
  const [eventNameMap, setEventNameMap] = React.useState<Record<string, string>>({});
  const [mounted, setMounted] = React.useState(false);

  const normalizedPath = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';
  const ignoreKey = ignore.join(',');

  const segments = React.useMemo(
    () => normalizedPath.split('/').filter(Boolean).filter((s) => !ignore.includes(s)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [normalizedPath, ignoreKey],
  );

  React.useEffect(() => { setMounted(true); }, []);

  React.useEffect(() => {
    const eventsIdx = segments.indexOf('events');
    if (eventsIdx !== -1 && segments[eventsIdx + 1]) {
      const eventId = segments[eventsIdx + 1];
      const href = '/' + segments.slice(0, eventsIdx + 2).join('/');
      getEventById(eventId)
        .then((event) => {
          if (event) setEventNameMap((prev) => ({ ...prev, [href]: event.name }));
        })
        .catch(() => {});
    }
  }, [segments]);

  const hrefLabelMap = React.useMemo(() => buildHrefLabelMap(), []);

  const finalLabelMap = React.useMemo(() => ({
    ...hrefLabelMap,
    ...customLabels,
  }), [hrefLabelMap, customLabels]);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    const label = finalLabelMap[href]
      ?? (mounted ? eventNameMap[href] : undefined)
      ?? SEGMENT_LABELS[seg]
      ?? humanizeSegment(seg);
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Fil d'ariane" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400 truncate">
        {crumbs.map((c) => (
          <li key={c.href} className="flex items-center gap-1 shrink-0">
            {c.isLast ? (
              <span className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
                {c.label}
              </span>
            ) : (
              <>
                <Link
                  href={c.href}
                  className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors truncate"
                >
                  {c.label}
                </Link>
                <ChevronRight size={14} className="opacity-60 shrink-0" />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ variant = 'default', ...props }) => {
  if (variant === 'navigation') {
    return <NavigationBreadcrumb className={props.className} />;
  }
  return <DefaultBreadcrumb {...props} />;
};
