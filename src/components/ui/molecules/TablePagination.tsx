'use client';

import { Pagination } from './Pagination';
import type { PaginationProps } from './Pagination';

export type TablePaginationProps = Omit<PaginationProps, 'variant'>;

/** Alias de Pagination variant="full" pour compatibilité */
export function TablePagination(props: TablePaginationProps) {
  return <Pagination {...props} variant="full" />;
}
