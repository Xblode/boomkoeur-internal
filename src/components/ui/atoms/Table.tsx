'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineEdit } from './InlineEdit';
import { Select } from './Select';

// ── Table Context ───────────────────────────────────────────────────────────

interface TableContextValue {
  resizable?: boolean;
  fillColumn?: boolean;
  expandable?: boolean;
  addable?: boolean;
  onAddRow?: (values: string[]) => void;
  columnWidths: Record<number, number>;
  columnMinWidths: Record<number, number>;
  setColumnWidth: (index: number, width: number) => void;
  setColumnWidths: (updates: Record<number, number>) => void;
  registerColumn: (minWidth: number, defaultWidth?: number) => number;
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
  /** Ligne permanente en bas pour ajouter des lignes (placeholder "+ Ajouter une ligne") */
  addable?: boolean;
  /** Callback appelé à la validation (blur/Enter) avec les valeurs des colonnes */
  onAddRow?: (values: string[]) => void;
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean;
  hoverCellOnly?: boolean;
  /** Contenu affiché sous la ligne quand déplié (nécessite Table expandable) */
  expandContent?: React.ReactNode;
}

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  /** Largeur minimale en px (lors du redimensionnement) */
  minWidth?: number;
  /** Largeur optimale proposée par défaut (sinon minWidth) — personnalisable par l'utilisateur */
  defaultWidth?: number;
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
}

// ── Table ────────────────────────────────────────────────────────────────────

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'default', resizable = true, fillColumn = true, expandable = false, addable = false, onAddRow, children, ...props }, ref) => {
    const [columnWidths, setColumnWidthsState] = useState<Record<number, number>>({});
    const [columnMinWidths, setColumnMinWidths] = useState<Record<number, number>>({});
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

    const registerColumn = useCallback((minWidth: number, defaultWidth?: number) => {
      const index = columnCountRef.current++;
      const optimalWidth = defaultWidth ?? minWidth;
      columnDefaultWidthsRef.current = { ...columnDefaultWidthsRef.current, [index]: optimalWidth };
      setColumnMinWidths((prev) => ({ ...prev, [index]: minWidth }));
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
      columnWidths,
      columnMinWidths,
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
                fillColumn={fillColumn}
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

function TableColgroup({
  columnCount,
  columnWidths,
  columnMinWidths,
  fillColumn,
}: {
  columnCount: number;
  columnWidths: Record<number, number>;
  columnMinWidths: Record<number, number>;
  fillColumn: boolean;
}) {
  if (columnCount === 0) return null;
  return (
    <colgroup>
      {Array.from({ length: columnCount }, (_, i) => {
        const width = columnWidths[i] ?? columnMinWidths[i] ?? 120;
        return <col key={i} style={{ width: `${width}px` }} />;
      })}
      {fillColumn && <col key="fill" />}
    </colgroup>
  );
}

// ── TableHeader ──────────────────────────────────────────────────────────────

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useTableContext();

    const content = ctx?.fillColumn
      ? React.Children.map(children, (child) => {
          if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
            return React.cloneElement(child, {
              children: [
                ...React.Children.toArray(child.props.children),
                <th key="fill" className="w-full min-w-0" />,
              ],
            });
          }
          return child;
        })
      : children;

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

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useTableContext();

    const content = ctx?.fillColumn
      ? React.Children.map(children, (child) => {
          if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
            return React.cloneElement(child, {
              children: [
                ...React.Children.toArray(child.props.children),
                <td key="fill" className="w-full min-w-0 p-0" />,
              ],
            });
          }
          return child;
        })
      : children;

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
      {cells}
      {fillColumn && <td key="fill" className="w-full min-w-0 p-0" />}
    </tr>
  );
}

// ── TableRow ──────────────────────────────────────────────────────────────────

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, clickable, hoverCellOnly, expandContent, rowActions, children, ...props }, ref) => {
    const ctx = useTableContext();
    const [expanded, setExpanded] = useState(false);
    const canExpand = Boolean(expandContent && ctx?.expandable);
    const colSpan = (ctx?.columnCount ?? 0) + (ctx?.fillColumn ? 1 : 0);

    const rowClassName = cn(
      'group/row transition-colors',
      !hoverCellOnly && 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
      clickable && 'cursor-pointer',
      className
    );

    if (canExpand) {
      const childArray = React.Children.toArray(children);
      const firstChild = childArray[0];
      const restChildren = childArray.slice(1);
      const firstChildProps = React.isValidElement(firstChild) ? firstChild.props : {};
      const firstChildContent = React.isValidElement(firstChild) ? firstChild.props.children : firstChild;

      return (
        <>
          <tr ref={ref} className={rowClassName} {...props}>
            <TableCell
              expandable
              expanded={expanded}
              onExpandToggle={() => setExpanded((e) => !e)}
              align={firstChildProps.align as 'left' | 'center' | 'right' | undefined}
              rowActions={rowActions}
            >
              {firstChildContent}
            </TableCell>
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
      const childArray = React.Children.toArray(children);
      const firstChild = childArray[0];
      const restChildren = childArray.slice(1);

      return (
        <tr ref={ref} className={rowClassName} {...props}>
          {React.isValidElement(firstChild)
            ? React.cloneElement(firstChild as React.ReactElement<TableCellProps>, { rowActions })
            : firstChild}
          {restChildren}
        </tr>
      );
    }

    return (
      <tr ref={ref} className={rowClassName} {...props}>
        {children}
      </tr>
    );
  }
);
TableRow.displayName = 'TableRow';

// ── TableHead ────────────────────────────────────────────────────────────────

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = 'left', sortable, minWidth = 80, defaultWidth, children, ...props }, ref) => {
    const ctx = useTableContext();
    const [index, setIndex] = useState<number | null>(null);

    useEffect(() => {
      if (ctx && index === null) {
        const idx = ctx.registerColumn(minWidth, defaultWidth);
        setIndex(idx);
      }
    }, [ctx, minWidth, defaultWidth, index]);

    const isResizing = ctx?.resizable === true && index !== null;

    const handleResizeStart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        if (!ctx || index === null) return;

        const startX = e.clientX;
        const startWidth = ctx.columnWidths[index] ?? ctx.columnMinWidths[index] ?? minWidth;
        const minW = ctx.columnMinWidths[index] ?? minWidth;

        const sumOtherWidths = Array.from({ length: ctx.columnCount }, (_, j) =>
          j === index ? 0 : ctx.columnWidths[j] ?? ctx.columnMinWidths[j] ?? 120
        ).reduce((a, b) => a + b, 0);

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const containerWidth = ctx.containerRef.current?.offsetWidth ?? 0;
          const maxWidth = containerWidth > 0 ? containerWidth - sumOtherWidths : Infinity;

          const diff = moveEvent.clientX - startX;
          const requestedWidth = startWidth + diff;
          const newWidth = Math.max(minW, Math.min(maxWidth, requestedWidth));

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
          'relative px-3 py-2.5 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400',
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

const CELL_WRAPPER_CLASS = cn(
  'relative z-0 h-full min-h-8 min-w-0 rounded px-2 py-1 transition-[box-shadow]',
  'overflow-hidden text-ellipsis whitespace-nowrap',
  'hover:z-20 hover:ring-1 hover:ring-zinc-300 dark:hover:ring-white/50',
  'focus-within:z-20 focus-within:ring-0'
);

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
      children,
      ...props
    },
    ref
  ) => {
    const alignClass =
      align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

    const cellContent = (() => {
      if (editable && onChange) {
        return (
          <InlineEdit
            variant="table"
            value={value ?? ''}
            onChange={onChange}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            showEditIcon={false}
            className={cn('min-w-0 truncate', align === 'center' && 'justify-center', align === 'right' && 'justify-end')}
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
            className={cn('min-w-0 truncate', align === 'center' && 'justify-center', align === 'right' && 'justify-end')}
          />
        );
      }
      return (
        <div className={cn('flex min-h-8 min-w-0 items-center truncate px-2 py-1 text-xs', alignClass)}>
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

    const innerContent = (
      <div className={CELL_WRAPPER_CLASS}>
        {expandable && onExpandToggle ? (
          <div className="flex min-h-8 min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onExpandToggle();
                }}
                className="shrink-0 p-0.5 ml-[5px] text-zinc-500 dark:text-zinc-400"
                aria-expanded={expanded}
                aria-label={expanded ? 'Replier' : 'Déplier'}
              >
                {expanded ? (
                  <ChevronDown size={14} className="shrink-0" />
                ) : (
                  <ChevronRight size={14} className="shrink-0" />
                )}
              </button>
              <div className="min-w-0 flex-1 overflow-hidden">{cellContent}</div>
            </div>
            {actionsNode}
          </div>
        ) : rowActions && rowActions.length > 0 ? (
          <div className="flex min-h-8 min-w-0 items-center justify-between gap-2">
            <div className="min-w-0 flex-1 overflow-hidden">{cellContent}</div>
            {actionsNode}
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
