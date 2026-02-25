'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableAddSubTaskRow,
} from '@/components/ui/atoms';
import { Button } from '@/components/ui/atoms';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/atoms';
import type {
  ColumnDef,
  SchemaTableProps,
  BadgeVariant,
} from '@/types/tableColumns';

const BADGE_STYLES: Record<BadgeVariant, string> = {
  supplier: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  contact: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  partner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  lieu: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  lead: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  inactive: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
};

export function SchemaTable<T extends { id: string }>({
  data,
  columns,
  expandContent,
  addRowLabel = 'Ajouter',
  onAddRow,
  onRowClick,
  expandedId,
  onExpandedChange,
  variant = 'default',
  className,
  initialEditCell,
  getStatusContent,
  getSubTasks,
  onAddSubTask,
  addingSubTaskToId = null,
  onAddSubTaskCancel,
}: SchemaTableProps<T>) {
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [subTaskExpandedIds, setSubTaskExpandedIds] = useState<Set<string>>(new Set());

  const expanded = expandedId ?? null;

  useEffect(() => {
    if (initialEditCell) {
      const row = data.find((r) => r.id === initialEditCell.id);
      if (row) {
        const col = columns.find((c) => c.key === initialEditCell.key);
        if (col && col.type === 'text') {
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }
    }
  }, [initialEditCell?.id, initialEditCell?.key, data, columns]);

  const handleExpandToggle = (row: T) => {
    if (onExpandedChange) {
      onExpandedChange(expanded === row.id ? null : row.id);
    } else if (onRowClick) {
      onRowClick(row);
    }
  };

  const dataColumns = columns.filter((c) => c.type !== 'expand' && c.type !== 'add');
  const hasExpand = columns.some((c) => c.type === 'expand');
  const hasActions = columns.some((c) => c.type === 'actions');
  const addRowColSpan = dataColumns.length - (hasActions ? 1 : 0);

  const renderCell = (row: T, col: ColumnDef<T>, indentLevel = 0) => {
    if (col.type === 'expand' || col.type === 'add') return null;

    if (col.type === 'text') {
      const value = col.getValue(row);
      const isFirstCol = dataColumns[0]?.key === col.key;
      if (col.editable && col.onChange) {
        return (
          <TableCell
            noHoverBorder={col.key === 'name'}
            editable
            value={value}
            onChange={(e) => col.onChange?.(row, e.target.value)}
            placeholder={col.placeholder}
            align={col.align}
            indentLevel={isFirstCol ? indentLevel : 0}
          />
        );
      }
      return (
        <TableCell noHoverBorder={col.key === 'name'} align={col.align} indentLevel={isFirstCol ? indentLevel : 0}>
          {value || col.placeholder || '—'}
        </TableCell>
      );
    }

    if (col.type === 'select') {
      const value = col.getValue(row);
      const label =
        col.options.find((o) => o.value === value)?.label ?? value;
      const badgeVariant = col.getBadgeVariant?.(value) ?? 'default';
      const isFirstCol = dataColumns[0]?.key === col.key;

      return (
        <TableCell noHoverBorder align={col.align} indentLevel={isFirstCol ? indentLevel : 0}>
          <Popover
            open={popoverOpen === `${row.id}-${col.key}`}
            onOpenChange={(o) => setPopoverOpen(o ? `${row.id}-${col.key}` : null)}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-between gap-2 w-full min-h-8 min-w-0 px-2 py-1 text-left cursor-pointer rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopoverOpen(`${row.id}-${col.key}`);
                }}
              >
                {col.badge ? (
                  <span
                    className={cn(
                      'text-xs font-medium py-0.5 rounded-full',
                      BADGE_STYLES[badgeVariant]
                    )}
                  >
                    {label}
                  </span>
                ) : (
                  <span className="text-zinc-600 dark:text-zinc-400 text-sm font-semibold">
                    {label}
                  </span>
                )}
                <ChevronDown size={12} className="text-zinc-400 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1" align="start">
              {col.options.map((opt) => (
                <Button
                  key={opt.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    col.onChange(row, opt.value);
                    setPopoverOpen(null);
                  }}
                  className={cn(
                    'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                    value === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                  )}
                >
                  {opt.label}
                </Button>
              ))}
            </PopoverContent>
          </Popover>
        </TableCell>
      );
    }

    if (col.type === 'actions') {
      const isFirstCol = dataColumns[0]?.key === col.key;
      return (
        <TableCell noHoverBorder align={col.align} className="w-12 max-w-12" indentLevel={isFirstCol ? indentLevel : 0}>
          {col.render(row)}
        </TableCell>
      );
    }

    if (col.type === 'custom') {
      const isFirstCol = dataColumns[0]?.key === col.key;
      return (
        <TableCell noHoverBorder align={col.align} indentLevel={isFirstCol ? indentLevel : 0}>
          {col.render(row)}
        </TableCell>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        variant === 'bordered' && 'border border-zinc-200 dark:border-zinc-800',
        className
      )}
    >
      <Table
        variant={variant === 'bordered' ? 'bordered' : 'default'}
        expandable={Boolean((expandContent && hasExpand) || (getStatusContent && (getSubTasks || onAddSubTask)))}
        addable={false}
        fillColumn={false}
        resizable={false}
        statusColumn={Boolean(getStatusContent)}
      >
        <TableHeader>
          <TableRow hoverCellOnly>
            {columns.map((col) => {
              if (col.type === 'expand') return null;
              if (col.type === 'add') {
                return (
                  <TableHead key={col.key} align="center" minWidth={48} maxWidth={48}>
                    {col.headerContent}
                  </TableHead>
                );
              }
              return (
                <TableHead
                  key={col.key}
                  align={col.align}
                  minWidth={col.minWidth ?? 80}
                  defaultWidth={col.defaultWidth}
                  maxWidth={col.maxWidth}
                >
                  {col.label}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const isExpanded = expanded === row.id;
            const subTasks = getSubTasks?.(row) ?? [];
            const hasSubTasks = subTasks.length > 0;
            const buildSubTaskRows = (parent: T, depth: number, parentPath: string): React.ReactNode => {
              const children = getSubTasks?.(parent) ?? [];
              const showAddForParent = addingSubTaskToId === parentPath;
              return (
                <>
                  {children.map((sub) => {
                    const subPath = `${parentPath}-${sub.id}`;
                    const subChildren = getSubTasks?.(sub) ?? [];
                    const subHasSubTasks = subChildren.length > 0;
                    const subSubTaskRows =
                      getStatusContent && getSubTasks
                        ? buildSubTaskRows(sub, depth + 1, subPath)
                        : undefined;
                    const statusPlaceholder = (
                      <div className="w-4 h-4 shrink-0 rounded-full border border-dashed border-zinc-300 dark:border-zinc-600" />
                    );
                    return (
                      <TableRow
                        key={sub.id}
                        statusContent={getStatusContent?.(sub) ?? statusPlaceholder}
                        expanded={subTaskExpandedIds.has(subPath)}
                        onExpandToggle={() =>
                          setSubTaskExpandedIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(subPath)) next.delete(subPath);
                            else next.add(subPath);
                            return next;
                          })
                        }
                        subTaskRows={subSubTaskRows}
                        hasSubTasks={subHasSubTasks}
                        onAddSubTask={
                          onAddSubTask
                            ? () => {
                                onAddSubTask(sub, undefined, subPath);
                                setSubTaskExpandedIds((prev) => new Set(prev).add(subPath));
                              }
                            : undefined
                        }
                      >
                        {columns.map((col) => {
                          if (col.type === 'expand' || col.type === 'add') return null;
                          return (
                            <React.Fragment key={col.key}>
                              {renderCell(sub, col, depth)}
                            </React.Fragment>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  {onAddSubTask && showAddForParent && (
                    <TableAddSubTaskRow
                      onValidate={(vals) => onAddSubTask(parent, vals)}
                      onCancel={onAddSubTaskCancel}
                      indentLevel={depth}
                    />
                  )}
                </>
              );
            };

            const subTaskRows =
              getStatusContent && (getSubTasks || onAddSubTask)
                ? buildSubTaskRows(row, 1, row.id)
                : undefined;

            return (
              <React.Fragment key={row.id}>
                <TableRow
                  clickable={hasExpand || Boolean(getStatusContent && (getSubTasks || onAddSubTask))}
                  expandContent={!getStatusContent ? expandContent?.(row) : undefined}
                  expanded={isExpanded}
                  onExpandToggle={() => handleExpandToggle(row)}
                  statusContent={getStatusContent?.(row)}
                  subTaskRows={subTaskRows}
                  hasSubTasks={hasSubTasks}
                  onAddSubTask={
                    onAddSubTask
                      ? () => {
                          onAddSubTask(row, undefined, row.id);
                          if (expanded !== row.id) onExpandedChange?.(row.id);
                        }
                      : undefined
                  }
                >
                  {columns.map((col) => {
                    if (col.type === 'expand' || col.type === 'add') return null;
                    return (
                      <React.Fragment key={col.key}>
                        {renderCell(row, col)}
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              </React.Fragment>
            );
          })}

          {onAddRow && (
            <tr
              className="border-t border-dashed border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
              onClick={onAddRow}
            >
              <td colSpan={Math.max(1, addRowColSpan)} className="p-0">
                <div className="flex items-center gap-2 min-h-8 px-3 py-2 text-zinc-400">
                  <Plus size={16} />
                  <span className="text-sm font-semibold">{addRowLabel}</span>
                </div>
              </td>
              {hasActions && <td className="p-0" />}
            </tr>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
