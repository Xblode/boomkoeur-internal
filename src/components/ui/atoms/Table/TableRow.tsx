'use client';

import React, { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { useTableContext } from './Table.context';
import { TableSelectionCell } from './TableBody';
import { ROW_PREFIX } from './Table.types';
import type { TableRowProps, TableRowAction, TableCellProps } from './Table.types';

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

export { TableRow };
