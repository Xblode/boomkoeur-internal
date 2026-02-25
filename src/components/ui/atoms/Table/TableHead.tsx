'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { useTableContext } from './Table.context';
import { COL_PREFIX } from './Table.types';
import type { TableHeadProps } from './Table.types';

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

    useEffect(() => {
      if (ctx) {
        const id = ctx.registerColumn(minWidth, defaultWidth, maxWidth, columnId) as string;
        setColumnKey(id);
      }
      // Ne pas dépendre de ctx : l'objet change à chaque re-render (ex: resize) et provoquerait une boucle infinie.
      // registerColumn est stable tant que reorderableColumns/columnOrderProp ne changent pas.
    }, [ctx?.registerColumn, minWidth, defaultWidth, maxWidth, columnId]);

    const sortableId = columnId && reorderableColumns ? COL_PREFIX + columnId : null;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: sortableId ?? `__head-${columnKey ?? 'pending'}`,
      disabled: !reorderableColumns || !columnId,
    });

    const isResizing = ctx?.resizable === true && columnKey !== null;

    const handleResizeStart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!ctx || columnKey === null) return;

        const startX = e.clientX;
        const startWidth = (ctx.columnWidths as Record<string, number>)[columnKey] ?? (ctx.columnMinWidths as Record<string, number>)[columnKey] ?? minWidth;
        const minW = (ctx.columnMinWidths as Record<string, number>)[columnKey] ?? minWidth;
        const maxW = (ctx.columnMaxWidths as Record<string, number>)[columnKey];
        const widths = ctx.columnWidths as Record<string, number>;
        const mins = ctx.columnMinWidths as Record<string, number>;
        const ids = columnOrder.length > 0 ? columnOrder : Object.keys(mins);

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
      [ctx, columnKey, minWidth, columnOrder]
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
            className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize -mr-1.5 flex items-center justify-center group z-10"
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

export { TableHead };
