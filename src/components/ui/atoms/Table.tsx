'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ChevronDown, ChevronRight, GripVertical, Plus } from 'lucide-react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Checkbox } from './Checkbox';
import { InlineEdit } from './InlineEdit';
import { Select } from './Select';
import { TagMultiSelect } from '@/components/ui/molecules/TagMultiSelect';

const COL_PREFIX = 'col-';
const ROW_PREFIX = 'row-';

// ── Table Context ───────────────────────────────────────────────────────────

interface TableContextValue {
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

const TableContext = createContext<TableContextValue | null>(null);

function useTableContext() {
  const ctx = useContext(TableContext);
  return ctx;
}

// ── Props ────────────────────────────────────────────────────────────────────

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

export interface TableRowAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  /** Quand true, le clic active l'édition inline de la cellule (éditable + rowActions) */
  activatesInlineEdit?: boolean;
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

// ── Table ────────────────────────────────────────────────────────────────────

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      variant = 'default',
      resizable = true,
      fillColumn = true,
      expandable = false,
      addable = false,
      onAddRow,
      selectionColumn = false,
      statusColumn = false,
      selectAllChecked,
      onSelectAllChange,
      reorderableColumns = false,
      reorderableRows = false,
      columnOrder: columnOrderProp,
      onColumnOrderChange,
      rowOrder: rowOrderProp,
      onRowOrderChange,
      children,
      ...props
    },
    ref
  ) => {
    const [columnWidths, setColumnWidthsState] = useState<Record<string, number>>({});
    const [columnMinWidths, setColumnMinWidths] = useState<Record<string, number>>({});
    const [columnMaxWidths, setColumnMaxWidths] = useState<Record<string, number>>({});
    const [columnOrderState, setColumnOrderState] = useState<string[]>([]);
    const [rowOrderState, setRowOrderState] = useState<string[]>([]);
    const columnCountRef = useRef(0);
    const columnDefaultWidthsRef = useRef<Record<string, number>>({});
    const columnMinWidthsRef = useRef<Record<string, number>>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const hasUserResizedRef = useRef(false);

    const columnOrder = columnOrderProp ?? columnOrderState;
    const setColumnOrder = useCallback(
      (updater: string[] | ((prev: string[]) => string[])) => {
        const next = typeof updater === 'function' ? updater(columnOrder) : updater;
        setColumnOrderState(next);
        onColumnOrderChange?.(next);
      },
      [columnOrder, onColumnOrderChange]
    );

    const derivedRowOrder = useMemo(() => {
      const body = React.Children.toArray(children).find(
        (c) => React.isValidElement(c) && (c.type as { displayName?: string })?.displayName === 'TableBody'
      );
      const bodyProps = React.isValidElement(body) ? (body.props as { children?: React.ReactNode }) : null;
      const bodyChildren = bodyProps?.children
        ? React.Children.toArray(bodyProps.children)
        : [];
      return bodyChildren
        .filter((c): c is React.ReactElement => React.isValidElement(c) && (c.props as { rowId?: string }).rowId != null)
        .map((c) => (c.props as { rowId: string }).rowId);
    }, [children]);

    const rowOrder = rowOrderProp ?? (rowOrderState.length > 0 ? rowOrderState : derivedRowOrder);
    const setRowOrder = useCallback(
      (updater: string[] | ((prev: string[]) => string[])) => {
        const next = typeof updater === 'function' ? updater(rowOrder) : updater;
        setRowOrderState(next);
        onRowOrderChange?.(next);
      },
      [rowOrder, onRowOrderChange]
    );

    useEffect(() => {
      if (reorderableRows && rowOrderState.length === 0 && derivedRowOrder.length > 0 && !rowOrderProp) {
        setRowOrderState(derivedRowOrder);
      }
    }, [reorderableRows, derivedRowOrder, rowOrderProp]);

    useEffect(() => {
      columnCountRef.current = 0;
      columnDefaultWidthsRef.current = {};
      columnMinWidthsRef.current = {};
      return () => {
        columnCountRef.current = 0;
      };
    }, []);

    const columnCount = columnOrder.length || Object.keys(columnMinWidths).length;
    const lastContainerWidthRef = useRef<number>(0);
    useEffect(() => {
      const el = containerRef.current;
      if (!el || columnCount === 0 || hasUserResizedRef.current) return;

      const updateWidthsFromContainer = () => {
        const w = el.offsetWidth;
        if (w <= 0) return;
        if (w === lastContainerWidthRef.current) return;
        lastContainerWidthRef.current = w;

        const selectionWidth = selectionColumn ? 48 : 0;
        const available = w - selectionWidth;
        const mins = columnMinWidthsRef.current;
        const order = columnOrder.length > 0 ? columnOrder : Object.keys(mins);

        const sumOtherMins = order
          .slice(1)
          .reduce((a, id) => a + (mins[id] ?? 120), 0);
        const firstColMin = mins[order[0]] ?? 120;
        const firstColWidth = Math.max(firstColMin, available - sumOtherMins);

        const updates: Record<string, number> = {};
        order.forEach((id, i) => {
          updates[id] = i === 0 ? firstColWidth : mins[id] ?? 120;
        });
        setColumnWidthsState((prev) => ({ ...prev, ...updates }));
      };

      lastContainerWidthRef.current = el.offsetWidth;
      updateWidthsFromContainer();
      const ro = new ResizeObserver(updateWidthsFromContainer);
      ro.observe(el);
      return () => ro.disconnect();
    }, [columnCount, selectionColumn, columnOrder]);

    const setColumnWidth = useCallback((indexOrId: number | string, width: number) => {
      hasUserResizedRef.current = true;
      const key = typeof indexOrId === 'number' ? String(indexOrId) : indexOrId;
      setColumnWidthsState((prev) => ({ ...prev, [key]: width }));
    }, []);

    const setColumnWidths = useCallback((updates: Record<number, number> | Record<string, number>) => {
      hasUserResizedRef.current = true;
      const normalized = Object.fromEntries(
        Object.entries(updates).map(([k, v]) => [String(k), v])
      );
      setColumnWidthsState((prev) => ({ ...prev, ...normalized }));
    }, []);

    const registerColumn = useCallback(
      (minWidth: number, defaultWidth?: number, maxWidth?: number, columnId?: string) => {
        const id = columnId ?? `__${columnCountRef.current++}`;
        const optimalWidth =
          maxWidth != null ? Math.min(maxWidth, defaultWidth ?? minWidth) : (defaultWidth ?? minWidth);
        columnDefaultWidthsRef.current = { ...columnDefaultWidthsRef.current, [id]: optimalWidth };
        columnMinWidthsRef.current = { ...columnMinWidthsRef.current, [id]: minWidth };
        setColumnMinWidths((prev) => ({ ...prev, [id]: minWidth }));
        if (maxWidth != null) setColumnMaxWidths((prev) => ({ ...prev, [id]: maxWidth }));
        setColumnWidthsState((prev) => ({ ...prev, [id]: prev[id] ?? optimalWidth }));
        if (reorderableColumns && columnId && !columnOrderProp) {
          setColumnOrderState((prev) => (prev.includes(columnId) ? prev : [...prev, columnId]));
        }
        return id;
      },
      [reorderableColumns, columnOrderProp]
    );

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        if (activeId.startsWith(COL_PREFIX) && overId.startsWith(COL_PREFIX)) {
          const colActive = activeId.slice(COL_PREFIX.length);
          const colOver = overId.slice(COL_PREFIX.length);
          const order = columnOrder.length > 0 ? columnOrder : [...columnOrderState];
          const oldIndex = order.indexOf(colActive);
          const newIndex = order.indexOf(colOver);
          if (oldIndex !== -1 && newIndex !== -1) {
            const next = arrayMove(order, oldIndex, newIndex);
            setColumnOrder(next);
          }
        } else if (activeId.startsWith(ROW_PREFIX) && overId.startsWith(ROW_PREFIX)) {
          const rowActive = activeId.slice(ROW_PREFIX.length);
          const rowOver = overId.slice(ROW_PREFIX.length);
          const order = rowOrder.length > 0 ? rowOrder : [...rowOrderState];
          const oldIndex = order.indexOf(rowActive);
          const newIndex = order.indexOf(rowOver);
          if (oldIndex !== -1 && newIndex !== -1) {
            const next = arrayMove(order, oldIndex, newIndex);
            setRowOrder(next);
          }
        }
      },
      [columnOrder, columnOrderState, rowOrder, rowOrderState, setColumnOrder, setRowOrder]
    );

    const value: TableContextValue = {
      resizable,
      fillColumn,
      expandable,
      addable,
      onAddRow,
      selectionColumn,
      statusColumn,
      selectAllChecked,
      onSelectAllChange,
      columnWidths,
      columnMinWidths,
      columnMaxWidths,
      setColumnWidth,
      setColumnWidths,
      registerColumn,
      columnCount,
      containerRef,
      columnOrder: columnOrder.length > 0 ? columnOrder : undefined,
      reorderableColumns,
      reorderableRows,
      rowOrder: rowOrder.length > 0 ? rowOrder : undefined,
    };

    const tableContent = (
      <TableContext.Provider value={value}>
        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <div ref={containerRef} className="w-full min-w-0">
            <table
            ref={ref}
            className={cn(
              'w-full min-w-0 text-sm overflow-visible',
              'table-fixed',
              variant === 'bordered' && 'border border-border-custom rounded-lg',
              className
            )}
            style={{ tableLayout: 'fixed', width: '100%' }}
            {...props}
          >
            {columnCount > 0 && (
              <TableColgroup
                columnOrder={columnOrder.length > 0 ? columnOrder : Object.keys(columnMinWidths)}
                columnWidths={columnWidths}
                columnMinWidths={columnMinWidths}
                columnMaxWidths={columnMaxWidths}
                fillColumn={fillColumn}
                selectionColumn={selectionColumn}
              />
            )}
            {children}
          </table>
          </div>
        </div>
      </TableContext.Provider>
    );

    if (reorderableColumns || reorderableRows) {
      return (
        <DndContext onDragEnd={handleDragEnd}>
          {tableContent}
        </DndContext>
      );
    }
    return tableContent;
  }
);
Table.displayName = 'Table';

// ── TableColgroup ────────────────────────────────────────────────────────────

const SELECTION_COLUMN_WIDTH = 48;

function TableColgroup({
  columnOrder,
  columnWidths,
  columnMinWidths,
  columnMaxWidths = {},
  fillColumn,
  selectionColumn,
}: {
  columnOrder: string[];
  columnWidths: Record<string, number>;
  columnMinWidths: Record<string, number>;
  columnMaxWidths?: Record<string, number>;
  fillColumn: boolean;
  selectionColumn?: boolean;
}) {
  if (columnOrder.length === 0) return null;
  return (
    <colgroup>
      {selectionColumn && <col key="selection" style={{ width: `${SELECTION_COLUMN_WIDTH}px` }} />}
      {columnOrder.map((id) => {
        let width = columnWidths[id] ?? columnMinWidths[id] ?? 120;
        const maxW = columnMaxWidths[id];
        if (maxW != null) width = Math.min(width, maxW);
        return <col key={id} style={{ width: `${width}px` }} />;
      })}
      {fillColumn && <col key="fill" />}
    </colgroup>
  );
}

// ── TableHeader ──────────────────────────────────────────────────────────────

function TableHeaderSelectionCell() {
  const ctx = useTableContext();
  const { selectAllChecked, onSelectAllChange } = ctx ?? {};
  return (
    <div className="flex items-center justify-center">
      {onSelectAllChange != null && (
        <Checkbox
          checked={selectAllChecked ?? false}
          onChange={(e) => onSelectAllChange(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
          aria-label="Tout sélectionner"
        />
      )}
    </div>
  );
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useTableContext();
    const columnOrder = ctx?.columnOrder ?? [];
    const reorderableColumns = ctx?.reorderableColumns ?? false;

    let content = children;
    if (ctx?.selectionColumn || ctx?.fillColumn || (reorderableColumns && columnOrder.length > 0)) {
      content = React.Children.map(content, (child) => {
        if (!React.isValidElement<{ children?: React.ReactNode }>(child) || !child.props.children) return child;
        let heads = React.Children.toArray(child.props.children);
        if (reorderableColumns && columnOrder.length > 0) {
          heads = columnOrder
            .map((id) => heads.find((h) => React.isValidElement(h) && (h.props as { columnId?: string }).columnId === id))
            .filter((h): h is React.ReactElement => h != null);
        }
        const sortedHeads =
          reorderableColumns && columnOrder.length > 0 ? (
            <SortableContext items={columnOrder.map((id) => COL_PREFIX + id)} strategy={horizontalListSortingStrategy}>
              {heads}
            </SortableContext>
          ) : (
            heads
          );
        const newChildren = [
          ...(ctx?.selectionColumn
            ? [
                <th
                  key="selection"
                  className={cn('w-[48px] min-w-[48px] border-0 p-0 align-middle', 'px-0 py-2.5')}
                >
                  <TableHeaderSelectionCell />
                </th>,
              ]
            : []),
          ...(Array.isArray(sortedHeads) ? sortedHeads : [sortedHeads]),
          ...(ctx?.fillColumn ? [<th key="fill" className="w-full min-w-0" />] : []),
        ];
        return React.cloneElement(child, { children: newChildren });
      });
    }

    return (
      <thead
        ref={ref}
        className={cn('border-b border-border-custom bg-zinc-50/50 dark:bg-zinc-900/30', className)}
        {...props}
      >
        {content}
      </thead>
    );
  }
);
TableHeader.displayName = 'TableHeader';

// ── TableBody ────────────────────────────────────────────────────────────────

function TableSelectionCell({
  selected,
  onSelectChange,
  dragListeners,
  dragAttributes,
  setActivatorRef,
}: {
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
  dragListeners?: Record<string, (e: React.SyntheticEvent) => void>;
  dragAttributes?: Record<string, unknown>;
  setActivatorRef?: (el: HTMLElement | null) => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 transition-opacity ml-1',
        selected ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100'
      )}
    >
      <span
        ref={setActivatorRef}
        className="cursor-grab text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 touch-none"
        aria-label="Déplacer la ligne"
        {...(dragListeners ?? {})}
        {...(dragAttributes ?? {})}
      >
        <GripVertical size={14} />
      </span>
      {onSelectChange != null && (
        <Checkbox
          checked={selected ?? false}
          onChange={(e) => onSelectChange(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
          aria-label="Sélectionner la ligne"
        />
      )}
    </div>
  );
}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useTableContext();
    const reorderableRows = ctx?.reorderableRows ?? false;
    const rowOrder = ctx?.rowOrder ?? [];

    let content = children;
    if (reorderableRows && rowOrder.length > 0) {
      const childArray = React.Children.toArray(children);
      const sorted = rowOrder
        .map((id) => childArray.find((c) => React.isValidElement(c) && (c.props as { rowId?: string }).rowId === id))
        .filter((c): c is React.ReactElement => c != null);
      content = (
        <SortableContext items={rowOrder.map((id) => ROW_PREFIX + id)} strategy={verticalListSortingStrategy}>
          {sorted}
        </SortableContext>
      );
    }

    return (
      <tbody ref={ref} className={cn('divide-y divide-border-custom', className)} {...props}>
        {content}
        {ctx?.addable && ctx?.onAddRow && <TableAddRow />}
      </tbody>
    );
  }
);
TableBody.displayName = 'TableBody';

// ── TableAddRow ───────────────────────────────────────────────────────────────

function TableAddRow() {
  const ctx = useTableContext();
  const columnCount = ctx?.columnCount ?? 0;
  const fillColumn = ctx?.fillColumn ?? false;
  const selectionColumn = ctx?.selectionColumn ?? false;
  const onAddRow = ctx?.onAddRow;

  const [addRowValues, setAddRowValues] = useState<string[]>([]);

  useEffect(() => {
    if (columnCount > 0) {
      setAddRowValues((prev) =>
        prev.length === columnCount ? prev : Array.from({ length: columnCount }, (_, i) => prev[i] ?? '')
      );
    }
  }, [columnCount]);

  const handleValidate = useCallback(() => {
    if (!onAddRow || (addRowValues[0] ?? '').trim() === '') return;
    const values = Array.from({ length: columnCount }, (_, i) => addRowValues[i] ?? '');
    onAddRow(values);
    setAddRowValues(Array.from({ length: columnCount }, () => ''));
  }, [onAddRow, addRowValues, columnCount]);

  const handleFirstCellBlur = useCallback(() => {
    handleValidate();
  }, [handleValidate]);

  const handleFirstCellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      }
    },
    []
  );

  const updateValue = useCallback((index: number, value: string) => {
    setAddRowValues((prev) => {
      const next = Array.from({ length: columnCount }, (_, i) => prev[i] ?? '');
      next[index] = value;
      return next;
    });
  }, [columnCount]);

  if (!ctx?.addable || !onAddRow || columnCount === 0) return null;

  const cells = Array.from({ length: columnCount }, (_, i) => (
    <TableCell
      key={i}
      editable
      value={addRowValues[i] ?? ''}
      onChange={(e) => updateValue(i, e.target.value)}
      onBlur={i === 0 ? handleFirstCellBlur : undefined}
      onKeyDown={i === 0 ? handleFirstCellKeyDown : undefined}
      placeholder={i === 0 ? '+ Ajouter une ligne' : ''}
    />
  ));

  return (
    <tr className="border-t border-border-custom">
      {selectionColumn && <td key="selection" className="w-[48px] min-w-[48px] border-0 p-0" />}
      {cells}
      {fillColumn && <td key="fill" className="w-full min-w-0 p-0" />}
    </tr>
  );
}

// ── TableAddSubTaskRow ────────────────────────────────────────────────────────

export interface TableAddSubTaskRowProps {
  onValidate: (values: string[]) => void;
  /** Appelé quand on blur la 1ère cellule sans avoir saisi (annule l'ajout) */
  onCancel?: () => void;
  placeholder?: string;
  /** Niveau d'indentation (1 = 30px, 2 = 60px, etc.) pour les sous-tâches imbriquées */
  indentLevel?: number;
}

function TableAddSubTaskRow({ onValidate, onCancel, placeholder = '+ Ajouter une sous-tâche', indentLevel = 1 }: TableAddSubTaskRowProps) {
  const ctx = useTableContext();
  const columnCount = ctx?.columnCount ?? 0;
  const fillColumn = ctx?.fillColumn ?? false;
  const selectionColumn = ctx?.selectionColumn ?? false;
  const rowRef = useRef<HTMLTableRowElement>(null);

  const [addRowValues, setAddRowValues] = useState<string[]>([]);

  useEffect(() => {
    if (columnCount > 0) {
      setAddRowValues((prev) =>
        prev.length === columnCount ? prev : Array.from({ length: columnCount }, (_, i) => prev[i] ?? '')
      );
    }
  }, [columnCount]);

  useEffect(() => {
    const input = rowRef.current?.querySelector('input');
    if (input) {
      const t = setTimeout(() => input.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [columnCount]);

  const handleValidate = useCallback(() => {
    if ((addRowValues[0] ?? '').trim() === '') return;
    const values = Array.from({ length: columnCount }, (_, i) => addRowValues[i] ?? '');
    onValidate(values);
    setAddRowValues(Array.from({ length: columnCount }, () => ''));
    const input = rowRef.current?.querySelector('input');
    if (input) setTimeout(() => input.focus(), 0);
  }, [onValidate, addRowValues, columnCount]);

  const handleFirstCellBlur = useCallback(() => {
    if ((addRowValues[0] ?? '').trim() === '') {
      onCancel?.();
    } else {
      handleValidate();
    }
  }, [handleValidate, addRowValues, onCancel]);

  const handleFirstCellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      }
    },
    []
  );

  const updateValue = useCallback((index: number, value: string) => {
    setAddRowValues((prev) => {
      const next = Array.from({ length: columnCount }, (_, i) => prev[i] ?? '');
      next[index] = value;
      return next;
    });
  }, [columnCount]);

  if (columnCount === 0) return null;

  const cells = Array.from({ length: columnCount }, (_, i) => (
    <TableCell
      key={i}
      editable
      value={addRowValues[i] ?? ''}
      onChange={(e) => updateValue(i, e.target.value)}
      onBlur={i === 0 ? handleFirstCellBlur : undefined}
      onKeyDown={i === 0 ? handleFirstCellKeyDown : undefined}
      placeholder={i === 0 ? placeholder : ''}
      indentLevel={i === 0 ? indentLevel : 0}
    />
  ));

  return (
    <tr ref={rowRef} className="border-t border-border-custom">
      {selectionColumn && <td key="selection" className="w-[48px] min-w-[48px] border-0 p-0" />}
      {cells}
      {fillColumn && <td key="fill" className="w-full min-w-0 p-0" />}
    </tr>
  );
}

// ── TableRow ──────────────────────────────────────────────────────────────────

const selectionCellNode = (
  selected?: boolean,
  onSelectChange?: (checked: boolean) => void,
  dragListeners?: Record<string, (e: React.SyntheticEvent) => void>,
  dragAttributes?: Record<string, unknown>,
  setActivatorRef?: (el: HTMLElement | null) => void
) => (
  <td key="selection" className="w-[48px] min-w-[48px] border-0 p-0 align-middle">
    <TableSelectionCell
      selected={selected}
      onSelectChange={onSelectChange}
      dragListeners={dragListeners}
      dragAttributes={dragAttributes}
      setActivatorRef={setActivatorRef}
    />
  </td>
);

function flattenRowChildren(children: React.ReactNode): React.ReactNode[] {
  const arr = React.Children.toArray(children);
  return arr.flatMap((child) =>
    React.isValidElement(child) && child.type === React.Fragment
      ? React.Children.toArray((child as React.ReactElement<{ children?: React.ReactNode }>).props.children)
      : [child]
  );
}

/** First child that is a React component (TableHead/TableCell), not a raw DOM element (th/td) */
function findFirstReactCell(children: React.ReactNode[]): { index: number; element: React.ReactElement } | null {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (React.isValidElement(child) && child.type !== 'th' && child.type !== 'td') {
      return { index: i, element: child };
    }
  }
  return null;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    {
      className,
      clickable,
      hoverCellOnly,
      expandContent,
      expanded: expandedProp,
      onExpandToggle,
      rowActions,
      selected,
      onSelectChange,
      status,
      onStatusChange,
      statusContent,
      tagsConfig,
      showTagsEditor,
      subTaskRows,
      hasSubTasks = false,
      onAddSubTask,
      rowId,
      children,
      ...props
    },
    ref
  ) => {
    const ctx = useTableContext();
    const reorderableRows = ctx?.reorderableRows ?? false;
    const reorderableColumns = ctx?.reorderableColumns ?? false;
    const columnOrder = ctx?.columnOrder ?? [];

    const sortableId = rowId && reorderableRows ? ROW_PREFIX + rowId : null;
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
      id: sortableId ?? `__row-${rowId ?? 'none'}`,
      disabled: !reorderableRows || !rowId,
    });
    const [internalExpanded, setInternalExpanded] = useState(false);
    const isControlled = expandedProp !== undefined;
    const expanded = isControlled ? expandedProp : internalExpanded;
    const handleExpandToggle = isControlled
      ? (onExpandToggle ?? (() => {}))
      : () => setInternalExpanded((e) => !e);
    const canExpandFromContent = Boolean(expandContent && ctx?.expandable);
    const canExpandFromSubTasks = Boolean(
      statusContent && ctx?.statusColumn && (subTaskRows || onAddSubTask)
    );
    const canExpand = canExpandFromContent || canExpandFromSubTasks;
    const addSubTaskAction: TableRowAction | null =
      statusContent && onAddSubTask
        ? { icon: <Plus size={14} />, label: 'Ajouter une sous-tâche', onClick: onAddSubTask }
        : null;
    const mergedRowActions = addSubTaskAction
      ? [addSubTaskAction, ...(rowActions ?? [])]
      : rowActions;
    const colSpan = (ctx?.columnCount ?? 0) + (ctx?.fillColumn ? 1 : 0) + (ctx?.selectionColumn ? 1 : 0);
    let flatChildren = flattenRowChildren(children);
    if (reorderableColumns && columnOrder.length > 0) {
      flatChildren = columnOrder
        .map((id) => flatChildren.find((c) => React.isValidElement(c) && (c.props as { columnId?: string }).columnId === id))
        .filter((c): c is React.ReactElement => c != null);
    }
    const firstChild = flatChildren[0];
    const isHeaderRow = React.isValidElement(firstChild) && firstChild.type === 'th';
    const selectionCell =
      ctx?.selectionColumn && !isHeaderRow
        ? selectionCellNode(
            selected,
            onSelectChange,
            reorderableRows && rowId ? (listeners as Record<string, (e: React.SyntheticEvent) => void>) : undefined,
            reorderableRows && rowId ? (attributes as unknown as Record<string, unknown>) : undefined,
            reorderableRows && rowId ? setActivatorNodeRef : undefined
          )
        : null;
    const fillCell = ctx?.fillColumn && !isHeaderRow ? (
      <td key="fill" className="w-full min-w-0 p-0" />
    ) : null;

    const rowClassName = cn(
      'group/row transition-colors',
      !hoverCellOnly && 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
      selected && 'bg-zinc-50 dark:bg-zinc-800/50',
      clickable && 'cursor-pointer',
      isDragging && 'opacity-50 z-10',
      className
    );

    const rowStyle = transform && reorderableRows ? { transform: CSS.Transform.toString(transform), transition } : undefined;
    const rowRefFn = useCallback(
      (node: HTMLTableRowElement | null) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref != null) {
          (ref as React.MutableRefObject<HTMLTableRowElement | null>).current = node;
        }
        setNodeRef(node);
      },
      [ref, setNodeRef]
    );

    if (canExpand) {
      const cellToInject = findFirstReactCell(flatChildren);
      const firstCellWithExpand = cellToInject
        ? React.cloneElement(cellToInject.element as React.ReactElement<TableCellProps>, {
            expandable: true,
            expanded,
            onExpandToggle: handleExpandToggle,
            rowActions: mergedRowActions,
            hasSubTasks: canExpandFromSubTasks ? hasSubTasks : true,
            ...(ctx?.statusColumn && {
              statusColumn: true,
              status: status ?? 'default',
              statusContent,
              onStatusChange,
            }),
          })
        : flatChildren[0];
      const before = cellToInject ? flatChildren.slice(0, cellToInject.index) : [];
      const after = cellToInject ? flatChildren.slice(cellToInject.index + 1) : flatChildren.slice(1);

      return (
        <>
          <tr ref={rowRefFn} style={rowStyle} className={rowClassName} {...props}>
            {selectionCell}
            {before}
            {firstCellWithExpand}
            {after}
            {fillCell}
          </tr>
          {expanded && subTaskRows}
          {expanded && !subTaskRows && expandContent && (
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/20">
              <td
                colSpan={colSpan}
                className="px-3 py-3 border-t border-border-custom align-top"
              >
                {expandContent}
              </td>
            </tr>
          )}
        </>
      );
    }

    if (mergedRowActions && mergedRowActions.length > 0) {
      const cellToInject = findFirstReactCell(flatChildren);
      const firstCellWithActions = cellToInject
        ? React.cloneElement(cellToInject.element as React.ReactElement<TableCellProps>, {
            rowActions: mergedRowActions,
            ...(ctx?.statusColumn && {
              statusColumn: true,
              status: status ?? 'default',
              statusContent,
              onStatusChange,
            }),
            ...(showTagsEditor && tagsConfig && {
              tagsConfig,
              showTagsEditor: true,
            }),
          })
        : flatChildren[0];
      const before = cellToInject ? flatChildren.slice(0, cellToInject.index) : [];
      const after = cellToInject ? flatChildren.slice(cellToInject.index + 1) : flatChildren.slice(1);

      return (
        <tr ref={rowRefFn} style={rowStyle} className={rowClassName} {...props}>
          {selectionCell}
          {before}
          {firstCellWithActions}
          {after}
          {fillCell}
        </tr>
      );
    }

    if (ctx?.statusColumn) {
      const cellToInject = findFirstReactCell(flatChildren);
      if (cellToInject) {
        const cloned = React.cloneElement(cellToInject.element as React.ReactElement<TableCellProps>, {
          statusColumn: true,
          status: status ?? 'default',
          statusContent,
          onStatusChange,
          ...(mergedRowActions && mergedRowActions.length > 0 && { rowActions: mergedRowActions }),
          ...(showTagsEditor && tagsConfig && {
            tagsConfig,
            showTagsEditor: true,
          }),
        });
        const before = flatChildren.slice(0, cellToInject.index);
        const after = flatChildren.slice(cellToInject.index + 1);
        return (
          <tr ref={rowRefFn} style={rowStyle} className={rowClassName} {...props}>
            {selectionCell}
            {before}
            {cloned}
            {after}
            {fillCell}
          </tr>
        );
      }
    }

    return (
      <tr ref={rowRefFn} style={rowStyle} className={rowClassName} {...props}>
        {selectionCell}
        {children}
        {fillCell}
      </tr>
    );
  }
);
TableRow.displayName = 'TableRow';

// ── TableHead ────────────────────────────────────────────────────────────────

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    {
      className,
      align = 'left',
      sortable,
      minWidth = 80,
      defaultWidth,
      maxWidth,
      columnId,
      statusColumn,
      status,
      onStatusChange,
      statusContent,
      children,
      ...props
    },
    ref
  ) => {
    const ctx = useTableContext();
    const [columnKey, setColumnKey] = useState<string | null>(null);
    const reorderableColumns = ctx?.reorderableColumns ?? false;
    const columnOrder = ctx?.columnOrder ?? [];
    const order = columnOrder.length > 0 ? columnOrder : (columnKey ? [columnKey] : []);

    useEffect(() => {
      if (ctx) {
        const id = ctx.registerColumn(minWidth, defaultWidth, maxWidth, columnId) as string;
        setColumnKey(id);
      }
    }, [ctx, minWidth, defaultWidth, maxWidth, columnId]);

    const sortableId = columnId && reorderableColumns ? COL_PREFIX + columnId : null;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: sortableId ?? `__head-${columnKey ?? 'pending'}`,
      disabled: !reorderableColumns || !columnId,
    });

    const isResizing = ctx?.resizable === true && columnKey !== null;

    const handleResizeStart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        if (!ctx || columnKey === null) return;

        const startX = e.clientX;
        const startWidth = (ctx.columnWidths as Record<string, number>)[columnKey] ?? (ctx.columnMinWidths as Record<string, number>)[columnKey] ?? minWidth;
        const minW = (ctx.columnMinWidths as Record<string, number>)[columnKey] ?? minWidth;
        const maxW = (ctx.columnMaxWidths as Record<string, number>)[columnKey];
        const widths = ctx.columnWidths as Record<string, number>;
        const mins = ctx.columnMinWidths as Record<string, number>;
        const ids = order.length > 0 ? order : Object.keys(mins);

        const sumOtherWidths = ids.reduce((a, id) => a + (id === columnKey ? 0 : (widths[id] ?? mins[id] ?? 120)), 0);
        const selectionWidth = ctx.selectionColumn ? 48 : 0;
        const containerWidthAtStart = ctx.containerRef.current?.offsetWidth ?? 0;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const rawWidth = ctx.containerRef.current?.offsetWidth ?? 0;
          const containerWidth = rawWidth > 50 ? rawWidth : containerWidthAtStart;
          const containerMax = containerWidth > 0 ? containerWidth - sumOtherWidths - selectionWidth : Infinity;
          const diff = moveEvent.clientX - startX;
          const requestedWidth = startWidth + diff;
          const effectiveMax = maxW != null ? Math.min(maxW, containerMax) : containerMax;
          const newWidth = Math.max(minW, Math.min(effectiveMax, requestedWidth));
          flushSync(() => ctx.setColumnWidth(columnKey, newWidth));
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        };

        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      },
      [ctx, columnKey, minWidth, order]
    );

    const style = transform && reorderableColumns
      ? { transform: CSS.Transform.toString(transform), transition }
      : undefined;

    const setRef = useCallback(
      (node: HTMLTableCellElement | null) => {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref != null) {
          (ref as React.MutableRefObject<HTMLTableCellElement | null>).current = node;
        }
        setNodeRef(node);
      },
      [ref, setNodeRef]
    );

    return (
      <th
        ref={setRef}
        className={cn(
          'relative px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400',
          'transition-colors rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/50',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          align === 'left' && 'text-left',
          isDragging && 'opacity-50 z-10',
          className
        )}
        style={style}
        {...(reorderableColumns && sortableId ? attributes : {})}
        {...(reorderableColumns && sortableId ? listeners : {})}
        {...props}
      >
        <span className="inline-flex items-center gap-1.5">
          {children}
          {sortable && (
            <span className="text-zinc-400 dark:text-zinc-500 font-normal" aria-hidden>
              ⇅
            </span>
          )}
        </span>
        {isResizing && (
          <div
            role="separator"
            aria-orientation="vertical"
            className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize -mr-1 flex items-center justify-center group"
            onMouseDown={handleResizeStart}
          >
            <div className="w-0.5 h-4 bg-transparent group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600 rounded-full transition-colors" />
          </div>
        )}
      </th>
    );
  }
);
TableHead.displayName = 'TableHead';

// ── TableCell ────────────────────────────────────────────────────────────────

const CELL_WRAPPER_BASE = cn(
  'relative z-0 h-full min-h-8 min-w-0 rounded px-2 py-1 transition-[box-shadow]',
  'overflow-hidden text-ellipsis whitespace-nowrap',
  'focus-within:z-20 focus-within:ring-0'
);

const CELL_WRAPPER_HOVER_RING = 'hover:z-20 hover:ring-1 hover:ring-zinc-300 dark:hover:ring-white/50';

function getTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  return '';
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  (
    {
      className,
      align = 'left',
      expandable = false,
      expanded = false,
      onExpandToggle,
      editable = false,
      value,
      onChange,
      onBlur,
      onKeyDown,
      placeholder = 'Saisir...',
      select,
      selectOptions = [],
      selectValue,
      onSelectChange,
      rowActions,
      statusColumn = false,
      status = 'default',
      onStatusChange,
      statusContent,
      noHoverBorder = false,
      tagsConfig,
      showTagsEditor = false,
      indentLevel = 0,
      hasSubTasks = true,
      children,
      style: styleProp,
      ...props
    },
    ref
  ) => {
    const hasEditTrigger = editable && rowActions?.some((a) => a.activatesInlineEdit);
    const [isEditModeActive, setIsEditModeActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isEditModeActive && hasEditTrigger) {
        const t = setTimeout(() => inputRef.current?.focus(), 0);
        return () => clearTimeout(t);
      }
    }, [isEditModeActive, hasEditTrigger]);

    const cellWrapperClass = cn(
      CELL_WRAPPER_BASE,
      !noHoverBorder && CELL_WRAPPER_HOVER_RING
    );
    const alignClass =
      align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

    const cellContent = (() => {
      if (editable && onChange) {
        if (hasEditTrigger && !isEditModeActive) {
          return (
            <div
              className={cn(
                'flex min-h-8 min-w-0 items-center px-1 py-0.5 text-sm font-semibold text-foreground',
                align === 'center' && 'justify-center',
                align === 'right' && 'justify-end'
              )}
            >
              {value || placeholder}
            </div>
          );
        }
        return (
          <InlineEdit
            ref={inputRef}
            variant="table"
            value={value ?? ''}
            onChange={onChange}
            onBlur={() => {
              if (hasEditTrigger) setIsEditModeActive(false);
              onBlur?.();
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            showEditIcon={false}
            className={cn('min-w-0', align === 'center' && 'justify-center', align === 'right' && 'justify-end')}
          />
        );
      }
      if (select && onSelectChange) {
        return (
          <Select
            variant="table"
            size="xs"
            value={selectValue ?? ''}
            onChange={onSelectChange}
            options={selectOptions}
            className={cn('min-w-0 truncate', align === 'center' && 'text-center', align === 'right' && 'text-right')}
          />
        );
      }
      const text = getTextFromChildren(children);
      if (text !== '' || (children === undefined || children === null)) {
        return (
          <InlineEdit
            variant="table"
            value={text}
            onChange={() => {}}
            readOnly
            showEditIcon={false}
            className={cn('min-w-0', align === 'center' && 'justify-center', align === 'right' && 'justify-end')}
          />
        );
      }
      return (
        <div className={cn('flex min-h-8 min-w-0 items-center truncate px-2 py-1 text-sm font-semibold', alignClass)}>
          {children}
        </div>
      );
    })();

    const actionsNode =
      rowActions && rowActions.length > 0 ? (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity ml-2">
          {rowActions.map((action, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (action.activatesInlineEdit && hasEditTrigger) {
                  setIsEditModeActive(true);
                }
                action.onClick();
              }}
              className="p-1 rounded text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              aria-label={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      ) : null;

    const statusIndicator = statusColumn ? (
      statusContent ? (
        <div className="shrink-0 mr-1.5 flex items-center" onClick={(e) => e.stopPropagation()}>
          {statusContent}
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange?.();
          }}
          className={cn(
            'shrink-0 w-4 h-4 rounded-full border-[1.5px] transition-colors mr-1.5',
            'hover:bg-zinc-100 dark:hover:bg-zinc-800',
            status === 'default' && 'border-dashed border-zinc-300 dark:border-zinc-600'
          )}
          aria-label="Changer l'état"
        />
      )
    ) : null;

    const tagsNode = showTagsEditor && tagsConfig ? (
      <TagMultiSelect
        variant="table"
        value={tagsConfig.value}
        onChange={tagsConfig.onChange}
        className="shrink-0 ml-1"
        placeholder="Ajouter une étiquette..."
      />
    ) : null;

    const chevronButton = expandable && onExpandToggle ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onExpandToggle();
        }}
        className={cn(
          'shrink-0 p-0.5 mr-[5px] rounded text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
          !hasSubTasks && 'opacity-0 pointer-events-none'
        )}
        aria-expanded={expanded}
        aria-label={expanded ? 'Replier' : 'Déplier'}
      >
        {expanded ? (
          <ChevronDown size={14} className="shrink-0" />
        ) : (
          <ChevronRight size={14} className="shrink-0" />
        )}
      </button>
    ) : null;

    const innerContent = (
      <div className={cellWrapperClass}>
        {expandable && onExpandToggle ? (
          <div className="flex min-h-8 min-w-0 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
              {chevronButton}
              {statusIndicator}
              <div className="flex min-w-0 shrink-0 items-center gap-0">
                <div className="shrink-0">{cellContent}</div>
                {tagsNode}
              </div>
            </div>
            {actionsNode}
          </div>
        ) : statusColumn ? (
          <div className="flex min-h-8 min-w-0 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
              {statusIndicator}
              <div className="flex min-w-0 shrink-0 items-center gap-0">
                <div className="shrink-0">{cellContent}</div>
                {tagsNode}
              </div>
            </div>
            {actionsNode}
          </div>
        ) : rowActions && rowActions.length > 0 ? (
          <div className="flex min-h-8 min-w-0 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
              {statusIndicator}
              <div className="flex min-w-0 shrink-0 items-center gap-0">
                <div className="shrink-0">{cellContent}</div>
                {tagsNode}
              </div>
            </div>
            {actionsNode}
          </div>
        ) : statusColumn ? (
          <div className="flex min-h-8 min-w-0 items-center gap-1 overflow-hidden">
            {statusIndicator}
            <div className="flex min-w-0 shrink-0 items-center gap-1">
              <div className="shrink-0">{cellContent}</div>
              {tagsNode}
            </div>
          </div>
        ) : (
          cellContent
        )}
      </div>
    );

    const indentStyle =
      indentLevel && indentLevel > 0 ? { paddingLeft: indentLevel * 30 } : undefined;
    const mergedStyle =
      indentStyle || styleProp ? { ...indentStyle, ...styleProp } : undefined;

    return (
      <td
        ref={ref}
        className={cn('p-0', alignClass, 'group/cell', className)}
        style={mergedStyle}
        {...props}
      >
        {innerContent}
      </td>
    );
  }
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableAddSubTaskRow };
