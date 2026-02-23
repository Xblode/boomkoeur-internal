'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MetadataCell {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}

export interface SectionHeaderProps {
  /** Titre principal (string simple ou ReactNode éditable) */
  title: React.ReactNode;
  /** Icône optionnelle (LucideIcon ou ReactNode) */
  icon?: React.ReactNode;
  /** Sous-titre optionnel */
  subtitle?: React.ReactNode;
  /** Actions à droite (boutons, selects, etc.) */
  actions?: React.ReactNode;
  /** Grille de métadonnées : chaque ligne = 2 ou 3 cellules (label + valeur). Active le mode "détail" avec bordure. */
  metadata?: MetadataCell[][];
  /** Section optionnelle (ex: tags avec chips + input) */
  tags?: React.ReactNode;
  /** Barre de recherche, filtres, etc. — affiché sous les métadonnées (ou sous le titre si pas de metadata) */
  filters?: React.ReactNode;
  /** Colonnes de la grille métadonnées (défaut: 120px 1fr 120px 1fr) */
  gridColumns?: string;
  className?: string;
}

/**
 * SectionHeader — En-tête unifié pour sections et pages détail
 *
 * Modes d'utilisation :
 * - Simple : icon + title (ex: "Trésorerie")
 * - Avec actions : icon + title + actions (ex: titre + selects à droite)
 * - Détail : title + metadata + tags (ex: page événement éditable)
 */
export function SectionHeader({
  title,
  icon,
  subtitle,
  actions,
  metadata,
  tags,
  filters,
  gridColumns = '120px 1fr 120px 1fr',
  className,
}: SectionHeaderProps) {
  const hasMetadata = metadata && metadata.length > 0;

  return (
    <div
      className={cn(
        'space-y-3',
        hasMetadata && 'pb-6 border-b border-border-custom',
        className
      )}
    >
      {/* Ligne titre : icon + title (+ actions) */}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {icon && <div className="shrink-0 flex items-center">{icon}</div>}
          <div className="min-w-0 flex-1">
            {typeof title === 'string' ? (
              <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            ) : (
              <div className="[&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:font-bold [&_h1]:m-0">
                {title}
              </div>
            )}
          </div>
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
      {/* Sous-titre : en dessous de l'icône et du titre, pleine largeur */}
      {subtitle && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</div>
      )}

      {/* Grille métadonnées (mode détail) */}
      {hasMetadata && (
        <div>
          <div
            className="grid gap-x-3 gap-y-1"
            style={{ gridTemplateColumns: gridColumns }}
          >
            {metadata!.map((row, rowIndex) => {
              const cell0 = row[0];
              const cell1 = row[1];
              const cell2 = row[2];
              const Icon0 = cell0?.icon;
              const Icon1 = cell1?.icon;
              const Icon2 = cell2?.icon;
              const colCount = gridColumns.split(/\s+/).length;
              const maxCells = colCount / 2;

              return (
                <React.Fragment key={rowIndex}>
                  {cell0 && Icon0 && (
                    <>
                      <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                        <Icon0 size={14} className="shrink-0" />
                        <span>{cell0.label}</span>
                      </div>
                      <div className="flex items-center min-w-0">{cell0.value}</div>
                    </>
                  )}
                  {maxCells >= 2 && (
                    cell1 && Icon1 ? (
                      <>
                        <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                          <Icon1 size={14} className="shrink-0" />
                          <span>{cell1.label}</span>
                        </div>
                        <div className="flex items-center min-w-0">{cell1.value}</div>
                      </>
                    ) : (
                      <div className="col-span-2" />
                    )
                  )}
                  {maxCells >= 3 && (
                    cell2 && Icon2 ? (
                      <>
                        <div className="flex items-center gap-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                          <Icon2 size={14} className="shrink-0" />
                          <span>{cell2.label}</span>
                        </div>
                        <div className="flex items-center min-w-0">{cell2.value}</div>
                      </>
                    ) : (
                      <div className="col-span-2" />
                    )
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {tags && <div className="py-5">{tags}</div>}
        </div>
      )}

      {/* Barre de recherche, filtres — sous métadonnées ou sous titre */}
      {filters && <div className="pt-4">{filters}</div>}
    </div>
  );
}
