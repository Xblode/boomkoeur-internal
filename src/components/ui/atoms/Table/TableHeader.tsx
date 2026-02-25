'use client';

import React from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { Checkbox } from '../Checkbox';
import { useTableContext } from './Table.context';
import { COL_PREFIX } from './Table.types';
import type { TableHeaderProps } from './Table.types';

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

export { TableHeader };
