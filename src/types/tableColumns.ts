/**
 * Types pour le système de colonnes déclaratives (DataTable / SchemaTable)
 * Permet de définir différents types de colonnes : text, select, actions, expand, add, etc.
 */

import type { ReactNode } from 'react';

export interface ColumnOption {
  value: string;
  label: string;
}

/** Style de badge pour les colonnes select/badge */
export type BadgeVariant = 'supplier' | 'contact' | 'partner' | 'lieu' | 'lead' | 'active' | 'inactive' | 'default';

/** Base commune à toutes les colonnes */
export interface BaseColumnDef<T> {
  key: string;
  /** Label du header (ignoré pour expand, add, actions) */
  label?: string;
  align?: 'left' | 'center' | 'right';
  minWidth?: number;
  defaultWidth?: number;
  maxWidth?: number;
  noHoverBorder?: boolean;
  sortable?: boolean;
}

/** Colonne expand : chevron pour déplier la ligne */
export interface ExpandColumnDef<T> extends BaseColumnDef<T> {
  type: 'expand';
}

/** Colonne texte simple ou éditable */
export interface TextColumnDef<T> extends BaseColumnDef<T> {
  type: 'text';
  /** Accesseur de la valeur */
  getValue: (row: T) => string;
  /** Callback quand éditable */
  onChange?: (row: T, value: string) => void;
  editable?: boolean;
  placeholder?: string;
}

/** Colonne select : popover avec options */
export interface SelectColumnDef<T> extends BaseColumnDef<T> {
  type: 'select';
  options: ColumnOption[];
  getValue: (row: T) => string;
  onChange: (row: T, value: string) => void;
  /** Affiche en badge coloré (ex: Type, Statut) */
  badge?: boolean;
  /** Mapping value -> variant pour le style du badge */
  getBadgeVariant?: (value: string) => BadgeVariant;
}

/** Colonne actions : boutons (delete, etc.) */
export interface ActionsColumnDef<T> extends BaseColumnDef<T> {
  type: 'actions';
  /** Largeur fixe recommandée */
  width?: number;
  render: (row: T) => ReactNode;
}

/** Colonne add : icône + dans le header, vide dans les lignes */
export interface AddColumnDef<T> extends BaseColumnDef<T> {
  type: 'add';
  /** Contenu du header (ex: icône Plus) */
  headerContent: ReactNode;
}

/** Colonne custom : rendu libre */
export interface CustomColumnDef<T> extends BaseColumnDef<T> {
  type: 'custom';
  header?: ReactNode;
  render: (row: T) => ReactNode;
}

export type ColumnDef<T> =
  | ExpandColumnDef<T>
  | TextColumnDef<T>
  | SelectColumnDef<T>
  | ActionsColumnDef<T>
  | AddColumnDef<T>
  | CustomColumnDef<T>;

/** Props pour SchemaTable */
export interface SchemaTableProps<T extends { id: string }> {
  data: T[];
  columns: ColumnDef<T>[];
  /** Contenu déplié sous chaque ligne */
  expandContent?: (row: T) => ReactNode;
  /** Ligne "Ajouter" en bas */
  addRowLabel?: string;
  onAddRow?: () => void;
  /** Ligne cliquable pour expand */
  onRowClick?: (row: T) => void;
  /** Ligne actuellement dépliée */
  expandedId?: string | null;
  onExpandedChange?: (id: string | null) => void;
  /** Variante visuelle du tableau */
  variant?: 'default' | 'bordered';
  className?: string;
  /** Cellule à ouvrir en édition au montage (ex: nouveau contact) */
  initialEditCell?: { id: string; key: string };
  /** Contenu du sélecteur d'état (EtatPicker) pour les lignes tâches */
  getStatusContent?: (row: T) => ReactNode;
  /** Sous-tâches d'une ligne parente */
  getSubTasks?: (row: T) => T[];
  /** Callback : (parent, undefined, path) au clic sur "+", (parent, values) à la validation. path = id pour afficher la ligne add */
  onAddSubTask?: (parentRow: T, values?: string[], parentPath?: string) => void;
  /** ID du parent pour lequel afficher la ligne "ajouter sous-tâche" (après clic sur "+") */
  addingSubTaskToId?: string | null;
  /** Callback quand on annule l'ajout (blur sans saisie) */
  onAddSubTaskCancel?: () => void;
}
