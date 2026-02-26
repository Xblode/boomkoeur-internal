'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { BackLink, SectionNavLink } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';

export interface PageSidebarSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  slug?: string;
}

export interface PageSidebarSectionGroup {
  /** Titre optionnel de la catégorie */
  title?: string;
  sections: PageSidebarSection[];
}

export interface PageSidebarProps {
  backLink?: { href: string; label: string };
  entitySelector?: React.ReactNode;
  /** Sections plates (si pas de sectionGroups) */
  sections?: PageSidebarSection[];
  /** Groupes de sections avec titres de catégorie */
  sectionGroups?: PageSidebarSectionGroup[];
  activeSectionId: string;
  onSectionChange?: (id: string) => void;
  basePath?: string;
  children?: React.ReactNode;
  className?: string;
  /** Mode compact (icônes seules) — utilisé sur mobile */
  compact?: boolean;
  /** Quand true, la barre compacte est rendue dans la toolbar (par le parent), pas ici */
  compactBarInToolbar?: boolean;
}

/**
 * PageSidebar - Sidebar de page avec structure standard
 *
 * Structure (de haut en bas) :
 * - BackLink (optionnel)
 * - EntitySelectorDropdown ou contenu custom (optionnel)
 * - SectionNavLink[] (liens ou boutons de sections), éventuellement groupés par catégorie
 * - children (optionnel, ex: SidebarCard[])
 *
 * Utiliser sectionGroups pour des catégories avec titres (ex: "Design System" → Atoms, Molecules).
 * Utiliser sections pour une liste plate.
 */
export function PageSidebar({
  backLink,
  entitySelector,
  sections = [],
  sectionGroups,
  activeSectionId,
  onSectionChange,
  basePath,
  children,
  className,
  compact = false,
  compactBarInToolbar = false,
}: PageSidebarProps) {
  const groups: PageSidebarSectionGroup[] =
    sectionGroups ?? (sections.length > 0 ? [{ sections }] : []);

  const hasNav = entitySelector || groups.some((g) => g.sections.length > 0);

  const allSections = groups.flatMap((g) => g.sections);

  const compactBar = compact && !compactBarInToolbar && allSections.length > 0 ? (
    <div
      className={cn(
        'lg:hidden shrink-0 flex flex-col gap-1 py-2 px-1 border-r border-zinc-200 dark:border-zinc-800 bg-backend w-[52px]',
        className
      )}
    >
      {backLink && (
        <Link
          href={backLink.href}
          className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0 flex items-center justify-center"
          title={backLink.label}
        >
          <ChevronLeft size={20} />
        </Link>
      )}
      {allSections.map((section) => {
        const href =
          section.href ??
          (basePath
            ? section.slug
              ? `${basePath}${section.slug}`
              : basePath
            : undefined);
        const active = activeSectionId === section.id;
        const content = (
          <span
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-md shrink-0 transition-colors mx-auto',
              active
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
            )}
            title={section.label}
          >
            {section.icon}
          </span>
        );
        if (href) {
            return (
              <Link key={section.id} href={href} className="flex-shrink-0">
                {content}
              </Link>
            );
          }
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onSectionChange?.(section.id)}
            className="flex-shrink-0"
          >
            {content}
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <>
      {compactBar}
      <aside
        className={cn(
          'w-64 shrink-0 bg-backend border-r border-zinc-200 dark:border-zinc-800 sticky top-[52px] h-[calc(100vh-52px)] overflow-y-auto',
          compact && 'hidden lg:block',
          className
        )}
      >
      <div className="p-4 space-y-4">
        {backLink && (
          <BackLink href={backLink.href} label={backLink.label} />
        )}

        {hasNav && (
          <div className={cn(backLink && 'border-t border-zinc-200 dark:border-zinc-800 pt-4')}>
            {entitySelector && (
              <div className="mb-3">{entitySelector}</div>
            )}
            <div className="space-y-4">
              {groups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-1">
                  {group.title && (
                    <h2 className="mb-3 px-2 font-bold text-sm">{group.title}</h2>
                  )}
                  <div className="space-y-0.5">
                    {group.sections.map((section) => {
                      const href =
                        section.href ??
                        (basePath
                          ? section.slug
                            ? `${basePath}${section.slug}`
                            : basePath
                          : undefined);
                      const active = activeSectionId === section.id;
                      return (
                        <SectionNavLink
                          key={section.id}
                          href={href}
                          onClick={
                            href ? undefined : () => onSectionChange?.(section.id)
                          }
                          icon={section.icon}
                          label={section.label}
                          active={active}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {children}
      </div>
    </aside>
    </>
  );
}
