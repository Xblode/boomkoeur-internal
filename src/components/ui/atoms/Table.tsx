'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from './Checkbox';
import { InlineEdit } from './InlineEdit';
import { Select } from './Select';
import { TagMultiSelect } from '@/components/ui/molecules/TagMultiSelect';

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
  columnWidths: Record<number, number>;
  columnMinWidths: Record<number, number>;
  columnMaxWidths: Record<number, number>;
  setColumnWidth: (index: number, width: number) => void;
  setColumnWidths: (updates: Record<number, number>) => void;
  registerColumn: (minWidth: number, defaultWidth?: number, maxWidth?: number) => number;
  columnCount: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
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
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean;
  hoverCellOnly?: boolean;
  /** Contenu affiché sous la ligne quand déplié (nécessite Table expandable) */
  expandContent?: React.ReactNode;
  /** Ligne sélectionnée (nécessite Table selectionColumn) */
  selected?: boolean;
  /** Callback quand la checkbox de sélection change */
  onSelectChange?: (checked: boolean) => void;
  /** État affiché par le sélecteur (nécessite Table statusColumn) */
  status?: 'default' | string;
  /** Callback quand on clique sur le sélecteur d'état */
  onStatusChange?: () => void;
  /** Config tags pour afficher TagMultiSelect à droite du nom (1ère cellule) */
  tagsConfig?: { value: string[]; onChange: (v: string[]) => void };
  /** Affiche TagMultiSelect dans la 1ère cellule quand true */
  showTagsEditor?: boolean;
  /** Boutons d'action affichés au survol dans la 1ère cellule */
  rowActions?: TableRowAction[];
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
  onStatusChange?: () => void;
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
  onStatusChange?: () => void;
  /** Tags affichés à droite du nom (injecté par TableRow quand showTagsEditor) */
  tagsConfig?: { value: string[]; onChange: (v: string[]) => void };
  /** Affiche TagMultiSelect à droite du contenu (injecté par TableRow) */
  showTagsEditor?: boolean;
  /** Désactive la bordure au survol de la cellule */
  noHoverBorder?: boolean;
}

// ── Table ────────────────────────────────────────────────────────────────────

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'default', resizable = true, fillColumn = true, expandable = false, addable = false, onAddRow, selectionColumn = false, statusColumn = false, selectAllChecked, onSelectAllChange, children, ...props }, ref) => {
    const [columnWidths, setColumnWidthsState] = useState<Record<number, number>>({});
    const [columnMinWidths, setColumnMinWidths] = useState<Record<number, number>>({});
    const [columnMaxWidths, setColumnMaxWidths] = useState<Record<number, number>>({});
    const [columnCount, setColumnCount] = useState(0);
    const columnCountRef = useRef(0);
    const columnDefaultWidthsRef = useRef<Record<number, number>>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const hasUserResizedRef = useRef(false);

    useEffect(() => {
      columnCountRef.current = 0;
      columnDefaultWidthsRef.current = {};
      return () => {
        columnCountRef.current = 0;
      };
    }, []);

    useEffect(() => {
      const el = containerRef.current;
      if (!el || columnCount === 0 || hasUserResizedRef.current) return;

      const updateWidthsFromContainer = () => {
        const w = el.offsetWidth;
        if (w <= 0) return;

        const defaults = columnDefaultWidthsRef.current;
        const total = Array.from({ length: columnCount }, (_, i) => defaults[i] ?? 120).reduce((a, b) => a + b, 0);
        if (total <= 0) return;

        const updates: Record<number, number> = {};
        for (let i = 0; i < columnCount; i++) {
          const prop = (defaults[i] ?? 120) / total;
          updates[i] = Math.round(prop * w);
        }
        setColumnWidthsState((prev) => ({ ...prev, ...updates }));
      };

      updateWidthsFromContainer();
      const ro = new ResizeObserver(updateWidthsFromContainer);
      ro.observe(el);
      return () => ro.disconnect();
    }, [columnCount]);

    const setColumnWidth = useCallback((index: number, width: number) => {
      hasUserResizedRef.current = true;
      setColumnWidthsState((prev) => ({ ...prev, [index]: width }));
    }, []);

    const setColumnWidths = useCallback((updates: Record<number, number>) => {
      hasUserResizedRef.current = true;
      setColumnWidthsState((prev) => ({ ...prev, ...updates }));
    }, []);

    const registerColumn = useCallback((minWidth: number, defaultWidth?: number, maxWidth?: number) => {
      const index = columnCountRef.current++;
      const optimalWidth = maxWidth != null ? Math.min(maxWidth, defaultWidth ?? minWidth) : (defaultWidth ?? minWidth);
      columnDefaultWidthsRef.current = { ...columnDefaultWidthsRef.current, [index]: optimalWidth };
      setColumnMinWidths((prev) => ({ ...prev, [index]: minWidth }));
      if (maxWidth != null) setColumnMaxWidths((prev) => ({ ...prev, [index]: maxWidth }));
      setColumnWidthsState((prev) => ({ ...prev, [index]: prev[index] ?? optimalWidth }));
      setColumnCount(columnCountRef.current);
      return index;
    }, []);

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
    };

    return (
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
                columnCount={columnCount}
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
  }
);
Table.displayName = 'Table';

// ── TableColgroup ────────────────────────────────────────────────────────────

const SELECTION_COLUMN_WIDTH = 48;

function TableColgroup({
  columnCount,
  columnWidths,
  columnMinWidths,
  columnMaxWidths = {},
  fillColumn,
  selectionColumn,
}: {
  columnCount: number;
  columnWidths: Record<number, number>;
  columnMinWidths: Record<number, number>;
  columnMaxWidths?: Record<number, number>;
  fillColumn: boolean;
  selectionColumn?: boolean;
}) {
  if (columnCount === 0) return null;
  return (
    <colgroup>
      {selectionColumn && <col key="selection" style={{ width: `${SELECTION_COLUMN_WIDTH}px` }} />}
      {Array.from({ length: columnCount }, (_, i) => {
        let width = columnWidths[i] ?? columnMinWidths[i] ?? 120;
        const maxW = columnMaxWidths[i];
        if (maxW != null) width = Math.min(width, maxW);
        return <col key={i} style={{ width: `${width}px` }} />;
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

    let content = children;
    if (ctx?.selectionColumn) {
      content = React.Children.map(content, (child) => {
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
          return React.cloneElement(child, {
            children: [
              <th
                key="selection"
                className={cn(
                  'w-[48px] min-w-[48px] border-0 p-0 align-middle',
                  'px-0 py-2.5'
                )}
              >
                <TableHeaderSelectionCell />
              </th>,
              ...React.Children.toArray(child.props.children),
            ],
          });
        }
        return child;
      });
    }
    if (ctx?.fillColumn) {
      content = React.Children.map(content, (child) => {
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
          return React.cloneElement(child, {
            children: [
              ...React.Children.toArray(child.props.children),
              <th key="fill" className="w-full min-w-0" />,
            ],
          });
        }
        return child;
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
}: {
  selected?: boolean;
  onSelectChange?: (checked: boolean) => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 transition-opacity ml-1',
        selected ? 'opacity-100' : 'opacity-0 group-hover/row:opacity-100'
      )}
    >
      <span
        className="cursor-grab text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 touch-none"
        aria-label="Déplacer la ligne"
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

    let content = children;
    if (ctx?.fillColumn) {
      content = React.Children.map(content, (child) => {
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
          return React.cloneElement(child, {
            children: [
              ...React.Children.toArray(child.props.children),
              <td key="fill" className="w-full min-w-0 p-0" />,
            ],
          });
        }
        return child;
      });
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

// ── TableRow ──────────────────────────────────────────────────────────────────

const selectionCellNode = (selected?: boolean, onSelectChange?: (checked: boolean) => void) => (
  <td key="selection" className="w-[48px] min-w-[48px] border-0 p-0 align-middle">
    <TableSelectionCell selected={selected} onSelectChange={onSelectChange} />
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

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, clickable, hoverCellOnly, expandContent, rowActions, selected, onSelectChange, status, onStatusChange, tagsConfig, showTagsEditor, children, ...props }, ref) => {
    const ctx = useTableContext();
    const [expanded, setExpanded] = useState(false);
    const canExpand = Boolean(expandContent && ctx?.expandable);
    const colSpan = (ctx?.columnCount ?? 0) + (ctx?.fillColumn ? 1 : 0) + (ctx?.selectionColumn ? 1 : 0);
    const flatChildren = flattenRowChildren(children);
    const firstChild = flatChildren[0];
    const isHeaderRow = React.isValidElement(firstChild) && firstChild.type === 'th';
    const selectionCell = ctx?.selectionColumn && !isHeaderRow ? selectionCellNode(selected, onSelectChange) : null;

    const rowClassName = cn(
      'group/row transition-colors',
      !hoverCellOnly && 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
      selected && 'bg-zinc-50 dark:bg-zinc-800/50',
      clickable && 'cursor-pointer',
      className
    );

    if (canExpand) {
      const firstChild = flatChildren[0];
      const restChildren = flatChildren.slice(1);
      const firstCellWithExpand = React.isValidElement(firstChild) ? (
        React.cloneElement(firstChild as React.ReactElement<TableCellProps>, {
          expandable: true,
          expanded,
          onExpandToggle: () => setExpanded((e) => !e),
          rowActions,
          ...(ctx?.statusColumn && {
            statusColumn: true,
            status: status ?? 'default',
            onStatusChange,
          }),
        })
      ) : firstChild;

      return (
        <>
          <tr ref={ref} className={rowClassName} {...props}>
            {selectionCell}
            {firstCellWithExpand}
            {restChildren}
          </tr>
          {expanded && (
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

    if (rowActions && rowActions.length > 0) {
      const firstChild = flatChildren[0];
      const restChildren = flatChildren.slice(1);

      return (
        <tr ref={ref} className={rowClassName} {...props}>
          {selectionCell}
          {          React.isValidElement(firstChild)
            ? React.cloneElement(firstChild as React.ReactElement<TableCellProps>, {
                rowActions,
                ...(ctx?.statusColumn && {
                  statusColumn: true,
                  status: status ?? 'default',
                  onStatusChange,
                }),
                ...(showTagsEditor && tagsConfig && {
                  tagsConfig,
                  showTagsEditor: true,
                }),
              })
            : firstChild}
          {restChildren}
        </tr>
      );
    }

    if (ctx?.statusColumn && flatChildren.length > 0 && React.isValidElement(flatChildren[0])) {
      const first = flatChildren[0];
      const rest = flatChildren.slice(1);
      return (
        <tr ref={ref} className={rowClassName} {...props}>
          {selectionCell}
          {React.cloneElement(first as React.ReactElement<TableCellProps>, {
            statusColumn: true,
            status: status ?? 'default',
            onStatusChange,
            ...(showTagsEditor && tagsConfig && {
              tagsConfig,
              showTagsEditor: true,
            }),
          })}
          {rest}
        </tr>
      );
    }

    return (
      <tr ref={ref} className={rowClassName} {...props}>
        {selectionCell}
        {children}
      </tr>
    );
  }
);
TableRow.displayName = 'TableRow';

// ── TableHead ────────────────────────────────────────────────────────────────

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = 'left', sortable, minWidth = 80, defaultWidth, maxWidth, statusColumn, status, onStatusChange, children, ...props }, ref) => {
    const ctx = useTableContext();
    const [index, setIndex] = useState<number | null>(null);

    useEffect(() => {
      if (ctx && index === null) {
        const idx = ctx.registerColumn(minWidth, defaultWidth, maxWidth);
        setIndex(idx);
      }
    }, [ctx, minWidth, defaultWidth, maxWidth, index]);

    const isResizing = ctx?.resizable === true && index !== null;

    const handleResizeStart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        if (!ctx || index === null) return;

        const startX = e.clientX;
        const startWidth = ctx.columnWidths[index] ?? ctx.columnMinWidths[index] ?? minWidth;
        const minW = ctx.columnMinWidths[index] ?? minWidth;
        const maxW = ctx.columnMaxWidths[index];

        const sumOtherWidths = Array.from({ length: ctx.columnCount }, (_, j) =>
          j === index ? 0 : ctx.columnWidths[j] ?? ctx.columnMinWidths[j] ?? 120
        ).reduce((a, b) => a + b, 0);

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const containerWidth = ctx.containerRef.current?.offsetWidth ?? 0;
          const containerMax = containerWidth > 0 ? containerWidth - sumOtherWidths : Infinity;

          const diff = moveEvent.clientX - startX;
          const requestedWidth = startWidth + diff;
          const effectiveMax = maxW != null ? Math.min(maxW, containerMax) : containerMax;
          const newWidth = Math.max(minW, Math.min(effectiveMax, requestedWidth));

          flushSync(() => ctx.setColumnWidth(index, newWidth));
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
      [ctx, index, minWidth]
    );

    return (
      <th
        ref={ref}
        className={cn(
          'relative px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400',
          'transition-colors rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/50',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          align === 'left' && 'text-left',
          className
        )}
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
      noHoverBorder = false,
      tagsConfig,
      showTagsEditor = false,
      children,
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
        className="shrink-0 p-0.5 mr-[5px] rounded text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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

    return (
      <td
        ref={ref}
        className={cn('p-0', alignClass, 'group/cell', className)}
        {...props}
      >
        {innerContent}
      </td>
    );
  }
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
