'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { TableContext } from './Table.context';
import { COL_PREFIX, ROW_PREFIX, SELECTION_COLUMN_WIDTH } from './Table.types';
import type { TableProps, TableContextValue } from './Table.types';

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

export { Table };
