'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTableContext } from './Table.context';
import { TableCell } from './TableCell';
import type { TableAddSubTaskRowProps } from './Table.types';

function TableAddSubTaskRow({ onValidate, onCancel, placeholder = '+ Ajouter une sous-tâche', indentLevel = 1 }: TableAddSubTaskRowProps) {
  const ctx = useTableContext();
  const columnCount = ctx?.columnCount ?? 0;
  const fillColumn = ctx?.fillColumn ?? false;
  const selectionColumn = ctx?.selectionColumn ?? false;
  const rowRef = useRef<HTMLTableRowElement>(null);

  const [addRowValues, setAddRowValues] = useState<string[]>([]);

  useEffect(() => {
    if (columnCount > 0) {
      setAddRowValues((prev) =>
        prev.length === columnCount ? prev : Array.from({ length: columnCount }, (_, i) => prev[i] ?? '')
      );
    }
  }, [columnCount]);

  useEffect(() => {
    const input = rowRef.current?.querySelector('input');
    if (input) {
      const t = setTimeout(() => input.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [columnCount]);

  const handleValidate = useCallback(() => {
    if ((addRowValues[0] ?? '').trim() === '') return;
    const values = Array.from({ length: columnCount }, (_, i) => addRowValues[i] ?? '');
    onValidate(values);
    setAddRowValues(Array.from({ length: columnCount }, () => ''));
    const input = rowRef.current?.querySelector('input');
    if (input) setTimeout(() => input.focus(), 0);
  }, [onValidate, addRowValues, columnCount]);

  const handleFirstCellBlur = useCallback(() => {
    if ((addRowValues[0] ?? '').trim() === '') {
      onCancel?.();
    } else {
      handleValidate();
    }
  }, [handleValidate, addRowValues, onCancel]);

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

  if (columnCount === 0) return null;

  const cells = Array.from({ length: columnCount }, (_, i) => (
    <TableCell
      key={i}
      editable
      value={addRowValues[i] ?? ''}
      onChange={(e) => updateValue(i, e.target.value)}
      onBlur={i === 0 ? handleFirstCellBlur : undefined}
      onKeyDown={i === 0 ? handleFirstCellKeyDown : undefined}
      placeholder={i === 0 ? placeholder : ''}
      indentLevel={i === 0 ? indentLevel : 0}
    />
  ));

  return (
    <tr ref={rowRef} className="border-t border-border-custom">
      {selectionColumn && <td key="selection" className="w-[48px] min-w-[48px] border-0 p-0" />}
      {cells}
      {fillColumn && <td key="fill" className="w-full min-w-0 p-0" />}
    </tr>
  );
}

export { TableAddSubTaskRow };
