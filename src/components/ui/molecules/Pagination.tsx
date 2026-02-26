'use client';

import { Button } from '@/components/ui/atoms';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  /** 'full' = prev/next + numéros de page, 'loadMore' = bouton "Voir plus (page X)" */
  variant?: 'full' | 'loadMore';
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  variant = 'full',
  className = '',
}: PaginationProps) {
  const startItem =
    variant === 'loadMore' ? 1 : (currentPage - 1) * itemsPerPage + 1;
  const endItem =
    variant === 'loadMore'
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : Math.min(currentPage * itemsPerPage, totalItems);
  const hasMore = currentPage < totalPages;

  return (
    <div
      className={`flex items-center justify-between border-t-2 border-border-custom pt-4 ${className}`}
    >
      <p className="text-sm text-zinc-500">
        Affichage de {startItem} à {endItem} sur {totalItems} résultat
        {totalItems > 1 ? 's' : ''}
      </p>

      {variant === 'full' && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédent
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page, index, array) => {
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsis && <span className="px-2 text-zinc-500">...</span>}
                    <Button
                      variant={page === currentPage ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className="min-w-[2.5rem]"
                    >
                      {page}
                    </Button>
                  </div>
                );
              })}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {variant === 'loadMore' && hasMore && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
        >
          Voir plus (page {currentPage + 1})
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
