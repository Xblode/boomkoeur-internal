import type React from 'react';

export const COL_PREFIX = 'col-';
export const ROW_PREFIX = 'row-';
export const SELECTION_COLUMN_WIDTH = 48;

export interface TableContextValue {
  resizable?: boolean;
  fillColumn?: boolean;
  expandable?: boolean;
  addable?: boolean;
  onAddRow?: (values: string[]) => void;
  selectionColumn?: boolean;
  statusColumn?: boolean;
  selectAllChecked?: boolean;
  onSelectAllChange?: (checked: boolean) => void;
  columnWidths: Record<number, number> | Record<string, number>;
  columnMinWidths: Record<number, number> | Record<string, number>;
  columnMaxWidths: Record<number, number> | Record<string, number>;
  setColumnWidth: (indexOrId: number | string, width: number) => void;
  setColumnWidths: (updates: Record<number, number> | Record<string, number>) => void;
  registerColumn: (minWidth: number, defaultWidth?: number, maxWidth?: number, columnId?: string) => number | string;
  columnCount: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** When reorderableColumns: order of columnIds for display */
  columnOrder?: string[];
  reorderableColumns?: boolean;
  reorderableRows?: boolean;
  rowOrder?: string[];
}

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'bordered' | 'striped';
  /** Colonnes redimensionnables par glisser-déposer (défaut: true) */
  resizable?: boolean;
  /** Colonne vide flexible qui comble l'espace restant et se réduit quand les autres s'agrandissent (défaut: true) */
  fillColumn?: boolean;
  /** Lignes dépliables avec expandContent */
  expandable?: boolean;
  /** Ligne permanente en bas pour ajouter des lignes (placeholder "+ Ajouter une ligne") */
  addable?: boolean;
  /** Callback appelé à la validation (blur/Enter) avec les valeurs des colonnes */
  onAddRow?: (values: string[]) => void;
  /** Colonne à gauche avec grip (drag) et checkbox (sélection multiple), visible au hover */
  selectionColumn?: boolean;
  /** État "tout sélectionner" pour la checkbox du header (nécessite selectionColumn) */
  selectAllChecked?: boolean;
  /** Callback quand la checkbox "tout sélectionner" change */
  onSelectAllChange?: (checked: boolean) => void;
  /** Sélecteur d'état (cercle dashed) à gauche du chevron dans la 1ère colonne */
  statusColumn?: boolean;
  /** Colonnes réordonnables par glisser-déposer (nécessite columnId sur TableHead/TableCell) */
  reorderableColumns?: boolean;
  /** Lignes réordonnables par glisser-déposer (nécessite rowId sur TableRow) */
  reorderableRows?: boolean;
  /** Ordre contrôlé des colonnes (ids) */
  columnOrder?: string[];
  /** Callback après réordonnancement des colonnes */
  onColumnOrderChange?: (ids: string[]) => void;
  /** Ordre contrôlé des lignes (ids) */
  rowOrder?: string[];
  /** Callback après réordonnancement des lignes */
  onRowOrderChange?: (ids: string[]) => void;
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableRowAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  /** Quand true, le clic active l'édition inline de la cellule (éditable + rowActions) */
  activatesInlineEdit?: boolean;
}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean;
  hoverCellOnly?: boolean;
  /** Contenu affiché sous la ligne quand déplié (nécessite Table expandable) */
  expandContent?: React.ReactNode;
  /** État déplié en mode contrôlé */
  expanded?: boolean;
  /** Callback quand on clique pour déplier/replier (mode contrôlé) */
  onExpandToggle?: () => void;
  /** Ligne sélectionnée (nécessite Table selectionColumn) */
  selected?: boolean;
  /** Callback quand la checkbox de sélection change */
  onSelectChange?: (checked: boolean) => void;
  /** État affiché par le sélecteur (nécessite Table statusColumn) */
  status?: 'default' | string;
  /** Composant personnalisé pour remplacer le cercle par défaut */
  statusContent?: React.ReactNode;
  /** Callback quand on clique sur le sélecteur d'état */
  onStatusChange?: () => void;
  /** Config tags pour afficher TagMultiSelect à droite du nom (1ère cellule) */
  tagsConfig?: { value: string[]; onChange: (v: string[]) => void };
  /** Affiche TagMultiSelect dans la 1ère cellule quand true */
  showTagsEditor?: boolean;
  /** Boutons d'action affichés au survol dans la 1ère cellule */
  rowActions?: TableRowAction[];
  /** Lignes sous-tâches à afficher quand déplié (statusContent = tâche) */
  subTaskRows?: React.ReactNode;
  /** Si true, le chevron est visible ; si false avec statusContent, chevron invisible */
  hasSubTasks?: boolean;
  /** Callback quand on clique sur "+" pour ajouter une sous-tâche (injecte l'action si statusContent) */
  onAddSubTask?: () => void;
  /** Identifiant unique pour le DnD des lignes (requis si reorderableRows) */
  rowId?: string;
}

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  /** Largeur minimale en px (lors du redimensionnement) */
  minWidth?: number;
  /** Largeur optimale proposée par défaut (sinon minWidth) — personnalisable par l'utilisateur */
  defaultWidth?: number;
  /** Largeur maximale en px (pour colonnes à largeur fixe, ex: minWidth=maxWidth) */
  maxWidth?: number;
  /** @internal injecté par TableRow quand statusColumn — ne pas passer au DOM */
  statusColumn?: boolean;
  /** @internal injecté par TableRow — ne pas passer au DOM */
  status?: 'default' | string;
  /** @internal injecté par TableRow — ne pas passer au DOM */
  statusContent?: React.ReactNode;
  /** @internal injecté par TableRow — ne pas passer au DOM */
  onStatusChange?: () => void;
  /** Identifiant unique pour le DnD des colonnes (requis si reorderableColumns) */
  columnId?: string;
}

export interface TableCellSelectOption {
  value: string;
  label: string;
}

export interface TableCellProps
  extends Omit<React.HTMLAttributes<HTMLTableCellElement>, 'onChange' | 'onBlur' | 'onKeyDown'> {
  align?: 'left' | 'center' | 'right';
  /** Affiche un chevron à gauche pour déplier (injecté par TableRow quand expandContent) */
  expandable?: boolean;
  expanded?: boolean;
  onExpandToggle?: () => void;
  editable?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  select?: boolean;
  selectOptions?: TableCellSelectOption[];
  selectValue?: string;
  onSelectChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Boutons d'action au hover (injecté par TableRow via rowActions) */
  rowActions?: TableRowAction[];
  /** Sélecteur d'état (cercle dashed) à gauche du contenu (injecté par TableRow quand statusColumn) */
  statusColumn?: boolean;
  status?: 'default' | string;
  statusContent?: React.ReactNode;
  onStatusChange?: () => void;
  /** Tags affichés à droite du nom (injecté par TableRow quand showTagsEditor) */
  tagsConfig?: { value: string[]; onChange: (v: string[]) => void };
  /** Affiche TagMultiSelect à droite du contenu (injecté par TableRow) */
  showTagsEditor?: boolean;
  /** Désactive la bordure au survol de la cellule */
  noHoverBorder?: boolean;
  /** Niveau d'indentation (0 = normal, 1 = 30px, 2 = 60px, etc.) */
  indentLevel?: number;
  /** Quand expandable, si false le chevron est invisible (opacity-0) */
  hasSubTasks?: boolean;
  /** Identifiant de colonne pour alignement avec TableHead (requis si reorderableColumns) */
  columnId?: string;
}

export interface TableAddSubTaskRowProps {
  onValidate: (values: string[]) => void;
  /** Appelé quand on blur la 1ère cellule sans avoir saisi (annule l'ajout) */
  onCancel?: () => void;
  placeholder?: string;
  /** Niveau d'indentation (1 = 30px, 2 = 60px, etc.) pour les sous-tâches imbriquées */
  indentLevel?: number;
}
