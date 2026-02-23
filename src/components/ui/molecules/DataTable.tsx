'use client';

import type { ReactNode } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: 'w-auto' | 'w-full';
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (item: T) => void;
  onRowHover?: (id: string | null) => void;
  emptyMessage?: string;
  emptyState?: ReactNode;
  className?: string;
  highlightRow?: (item: T) => string | undefined;
}

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  onSort,
  sortField,
  sortDirection,
  onRowClick,
  onRowHover,
  emptyMessage = 'Aucune donnée à afficher',
  emptyState,
  className = '',
  highlightRow,
}: DataTableProps<T>) {
  const handleSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey);
    }
  };

  if (data.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg bg-transparent h-full w-full min-h-[200px]">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border-custom">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-3 py-2.5 text-xs font-heading uppercase tracking-wider text-zinc-500',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.align !== 'center' && column.align !== 'right' && 'text-left',
                  column.sortable && 'cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-400 select-none',
                  column.width === 'w-auto' && 'w-auto whitespace-nowrap',
                  column.width === 'w-full' && 'w-full'
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div
                  className={cn(
                    'flex items-center gap-2',
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end'
                  )}
                >
                  {column.label}
                  {column.sortable && (
                    <ArrowUpDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform',
                        sortField === column.key && sortDirection === 'desc' && 'rotate-180',
                        sortField === column.key && 'text-zinc-900 dark:text-zinc-50'
                      )}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const highlightClass = highlightRow ? highlightRow(item) : undefined;

            return (
              <tr
                key={item.id ?? index}
                className={cn(
                  'border-b border-border-custom transition-all duration-200 h-12 group',
                  onRowClick && 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                  highlightClass
                )}
                onClick={() => onRowClick?.(item)}
                onMouseEnter={() => onRowHover?.(item.id ?? null)}
                onMouseLeave={() => onRowHover?.(null)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-3 py-2 h-12',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.width === 'w-auto' && 'w-auto whitespace-nowrap',
                      column.width === 'w-full' && 'w-full'
                    )}
                  >
                    {column.render ? column.render(item) : (item as Record<string, unknown>)[column.key] as ReactNode}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
