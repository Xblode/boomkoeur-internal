'use client';

import React from 'react';
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
}: PageSidebarProps) {
  const groups: PageSidebarSectionGroup[] =
    sectionGroups ?? (sections.length > 0 ? [{ sections }] : []);

  const hasNav = entitySelector || groups.some((g) => g.sections.length > 0);

  return (
    <aside
      className={cn(
        'w-64 shrink-0 bg-backend border-r border-border-custom sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto',
        className
      )}
    >
      <div className="p-4 space-y-4">
        {backLink && (
          <BackLink href={backLink.href} label={backLink.label} />
        )}

        {hasNav && (
          <div className={cn(backLink && 'border-t border-border-custom pt-4')}>
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
                        (basePath && section.slug
                          ? `${basePath}${section.slug}`
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
  );
}
