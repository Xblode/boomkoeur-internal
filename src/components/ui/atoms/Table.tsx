'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { cn } from '@/lib/utils';
import { InlineEdit } from './InlineEdit';
import { Select } from './Select';

// ── Table Context ───────────────────────────────────────────────────────────

interface TableContextValue {
  resizable?: boolean;
  fillColumn?: boolean;
  columnWidths: Record<number, number>;
  columnMinWidths: Record<number, number>;
  setColumnWidth: (index: number, width: number) => void;
  setColumnWidths: (updates: Record<number, number>) => void;
  registerColumn: (minWidth: number) => number;
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
}

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  clickable?: boolean;
  hoverCellOnly?: boolean;
}

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  /** Largeur minimale en px */
  minWidth?: number;
}

export interface TableCellSelectOption {
  value: string;
  label: string;
}

export interface TableCellProps
  extends Omit<React.HTMLAttributes<HTMLTableCellElement>, 'onChange' | 'onBlur' | 'onKeyDown'> {
  align?: 'left' | 'center' | 'right';
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
}

// ── Table ────────────────────────────────────────────────────────────────────

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant = 'default', resizable = true, fillColumn = true, children, ...props }, ref) => {
    const [columnWidths, setColumnWidthsState] = useState<Record<number, number>>({});
    const [columnMinWidths, setColumnMinWidths] = useState<Record<number, number>>({});
    const [columnCount, setColumnCount] = useState(0);
    const columnCountRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      columnCountRef.current = 0;
      return () => {
        columnCountRef.current = 0;
      };
    }, []);

    const setColumnWidth = useCallback((index: number, width: number) => {
      setColumnWidthsState((prev) => ({ ...prev, [index]: width }));
    }, []);

    const setColumnWidths = useCallback((updates: Record<number, number>) => {
      setColumnWidthsState((prev) => ({ ...prev, ...updates }));
    }, []);

    const registerColumn = useCallback((minWidth: number) => {
      const index = columnCountRef.current++;
      setColumnMinWidths((prev) => ({ ...prev, [index]: minWidth }));
      setColumnWidthsState((prev) => ({ ...prev, [index]: prev[index] ?? minWidth }));
      setColumnCount(columnCountRef.current);
      return index;
    }, []);

    const value: TableContextValue = {
      resizable,
      fillColumn,
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
      </tbody>
    );
  }
);
TableBody.displayName = 'TableBody';

// ── TableRow ──────────────────────────────────────────────────────────────────

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, clickable, hoverCellOnly, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors',
        !hoverCellOnly && 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
        clickable && 'cursor-pointer',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

// ── TableHead ────────────────────────────────────────────────────────────────

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = 'left', sortable, minWidth = 80, children, ...props }, ref) => {
    const ctx = useTableContext();
    const [index, setIndex] = useState<number | null>(null);

    useEffect(() => {
      if (ctx && index === null) {
        const idx = ctx.registerColumn(minWidth);
        setIndex(idx);
      }
    }, [ctx, minWidth, index]);

    const isResizing = ctx?.resizable === true && index !== null;

    const handleResizeStart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        if (!ctx || index === null) return;

        const startX = e.clientX;
        const startWidth = ctx.columnWidths[index] ?? ctx.columnMinWidths[index] ?? minWidth;
        const minW = ctx.columnMinWidths[index] ?? minWidth;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const diff = moveEvent.clientX - startX;
          const newWidth = Math.max(minW, startWidth + diff);
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

    return (
      <td
        ref={ref}
        className={cn('p-0', alignClass, 'group/cell', className)}
        {...props}
      >
        <div className={CELL_WRAPPER_CLASS}>{cellContent}</div>
      </td>
    );
  }
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
