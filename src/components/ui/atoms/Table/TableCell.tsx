'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineEdit } from '../InlineEdit';
import { Select } from '../Select';
import { TagMultiSelect } from '@/components/ui/molecules/TagMultiSelect';
import type { TableCellProps } from './Table.types';

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
      statusContent,
      noHoverBorder = false,
      tagsConfig,
      showTagsEditor = false,
      indentLevel = 0,
      hasSubTasks = true,
      favoriteConfig,
      inputRef: inputRefProp,
      children,
      style: styleProp,
      ...props
    },
    ref
  ) => {
    const hasEditTrigger = editable && rowActions?.some((a) => a.activatesInlineEdit);
    const [isEditModeActive, setIsEditModeActive] = useState(false);
    const internalInputRef = useRef<HTMLInputElement>(null);
    const inputRef = inputRefProp ?? internalInputRef;

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
        <div className="absolute top-0 right-0 flex h-full items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity pr-1">
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
      statusContent ? (
        <div className="shrink-0 mr-1.5 flex items-center" onClick={(e) => e.stopPropagation()}>
          {statusContent}
        </div>
      ) : (
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
      )
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

    const favoriteButton = favoriteConfig ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          favoriteConfig.onToggle();
        }}
        className={cn(
          'shrink-0 p-0.5 mr-1 rounded transition-colors',
          favoriteConfig.isFavorite
            ? 'text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300'
            : 'text-zinc-400 hover:text-amber-500 dark:text-zinc-500 dark:hover:text-amber-400'
        )}
        aria-label={favoriteConfig.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Star
          size={14}
          className={cn('shrink-0', favoriteConfig.isFavorite && 'fill-current')}
        />
      </button>
    ) : null;

    const chevronButton = expandable && onExpandToggle ? (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onExpandToggle();
        }}
        className={cn(
          'shrink-0 p-0.5 mr-[5px] rounded text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
          !hasSubTasks && 'opacity-0 pointer-events-none'
        )}
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
          <div className="relative flex min-h-8 min-w-0 items-center gap-2 pr-10">
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
              {chevronButton}
              {favoriteButton}
              {statusIndicator}
              <div className="flex min-w-0 shrink-0 items-center gap-0">
                <div className="shrink-0">{cellContent}</div>
                {tagsNode}
              </div>
            </div>
            {actionsNode}
          </div>
        ) : statusColumn ? (
          <div className="relative flex min-h-8 min-w-0 items-center gap-2 pr-10">
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
              {favoriteButton}
              {statusIndicator}
              <div className="flex min-w-0 shrink-0 items-center gap-0">
                <div className="shrink-0">{cellContent}</div>
                {tagsNode}
              </div>
            </div>
            {actionsNode}
          </div>
        ) : rowActions && rowActions.length > 0 ? (
          <div className="relative flex min-h-8 min-w-0 items-center gap-2 pr-10">
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
              {favoriteButton}
              {statusIndicator}
              <div className="flex min-w-0 shrink-0 items-center gap-0">
                <div className="shrink-0">{cellContent}</div>
                {tagsNode}
              </div>
            </div>
            {actionsNode}
          </div>
        ) : statusColumn ? (
          <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
            {favoriteButton}
            {statusIndicator}
            <div className="flex min-w-0 shrink-0 items-center gap-1">
              <div className="shrink-0">{cellContent}</div>
              {tagsNode}
            </div>
          </div>
        ) : favoriteConfig ? (
          <div className="flex min-h-8 min-w-0 items-center gap-1 overflow-hidden">
            {favoriteButton}
            {cellContent}
          </div>
        ) : (
          cellContent
        )}
      </div>
    );

    const indentStyle =
      indentLevel && indentLevel > 0 ? { paddingLeft: indentLevel * 30 } : undefined;
    const mergedStyle =
      indentStyle || styleProp ? { ...indentStyle, ...styleProp } : undefined;

    return (
      <td
        ref={ref}
        className={cn('p-0', alignClass, 'group/cell', className)}
        style={mergedStyle}
        {...props}
      >
        {innerContent}
      </td>
    );
  }
);
TableCell.displayName = 'TableCell';

export { TableCell };
