'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { backendNavigation, footerLinks, frontendNavigation } from '@/config/navigation';
import { getEventById } from '@/lib/localStorage/events';

export interface BreadcrumbProps {
  /**
   * Segments à ignorer (ex: ['_not-found'])
   */
  ignore?: string[];
  className?: string;
  /**
   * Labels personnalisés optionnels pour certaines routes spécifiques
   * Ex: { '/dashboard/settings': 'Configuration' }
   */
  customLabels?: Record<string, string>;
}

/**
 * Transforme un segment d'URL en label lisible
 * Exemples : "user-profile" → "User profile", "campagne-ete-x7k9p" → "Campagne ete"
 */
function humanizeSegment(seg: string): string {
  let displaySeg = seg;

  // Détecte et retire le code aléatoire à 5 caractères à la fin (format: -xxxxx)
  // Utilisé pour les IDs de campagne (ex: campagne-ete-x7k9p)
  const idCodePattern = /-[a-z0-9]{5}$/;
  if (idCodePattern.test(seg)) {
    displaySeg = seg.replace(idCodePattern, '');
  }

  // Remplace les tirets et underscores par des espaces
  const cleaned = displaySeg.replace(/[-_]/g, ' ').trim();
  // Première lettre en majuscule
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Labels fixes pour les segments de sous-routes connus
 */
const SEGMENT_LABELS: Record<string, string> = {
  campagne: 'Campagne',
  artistes: 'Artistes',
  planning: 'Planning',
  'elements-lies': 'Éléments liés',
};

/**
 * Construit une map des routes configurées vers leurs labels
 * Ceci est optionnel : si une route n'est pas dans cette map,
 * le breadcrumb générera automatiquement un label
 */
function buildHrefLabelMap(): Record<string, string> {
  const map: Record<string, string> = {};

  const add = (href: string, label: string) => {
    // Normalisation (pas de trailing slash)
    const key = href !== '/' ? href.replace(/\/+$/, '') : '/';
    map[key] = label;
  };

  // Frontend
  frontendNavigation.forEach(item => add(item.href, item.label));
  footerLinks.forEach(item => add(item.href, item.label));

  // Backend
  backendNavigation.forEach(item => add(item.href, item.label));

  return map;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  ignore = [], 
  className,
  customLabels = {}
}) => {
  const pathname = usePathname() ?? '/';

  // Résolution client-only des noms d'events (localStorage inaccessible côté SSR)
  const [eventNameMap, setEventNameMap] = React.useState<Record<string, string>>({});
  const [mounted, setMounted] = React.useState(false);

  // Normalisation du chemin
  const normalizedPath = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/';

  // Stabilise `ignore` pour éviter une nouvelle référence tableau à chaque render
  const ignoreKey = ignore.join(',');

  // Extraction des segments
  const segments = React.useMemo(
    () => normalizedPath.split('/').filter(Boolean).filter((s) => !ignore.includes(s)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [normalizedPath, ignoreKey]
  );

  // Montage client : une seule fois
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Résolution du nom d'event depuis localStorage (client uniquement)
  React.useEffect(() => {
    const map: Record<string, string> = {};
    const eventsIdx = segments.indexOf('events');
    if (eventsIdx !== -1 && segments[eventsIdx + 1]) {
      const eventId = segments[eventsIdx + 1];
      try {
        const event = getEventById(eventId);
        if (event) map['/' + segments.slice(0, eventsIdx + 2).join('/')] = event.name;
      } catch {
        // localStorage unavailable
      }
    }
    setEventNameMap(map);
  }, [segments]);
  
  // Construire la map des labels connus (depuis navigation.ts)
  const hrefLabelMap = React.useMemo(() => buildHrefLabelMap(), []);
  
  // Combiner avec les labels personnalisés (priorité aux customLabels)
  const finalLabelMap = React.useMemo(() => ({
    ...hrefLabelMap,
    ...customLabels
  }), [hrefLabelMap, customLabels]);

  // Pas de breadcrumb si on est à la racine ou sans segments
  if (segments.length === 0) return null;

  // Construction des miettes de pain
  const crumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    // Avant montage client : afficher l'ID brut pour éviter le mismatch d'hydratation
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
};

