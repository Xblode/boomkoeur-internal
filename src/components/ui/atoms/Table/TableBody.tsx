'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { Checkbox } from '../Checkbox';
import { useTableContext } from './Table.context';
import { TableCell } from './TableCell';
import { ROW_PREFIX } from './Table.types';
import type { TableBodyProps } from './Table.types';

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

export { TableBody, TableSelectionCell };
