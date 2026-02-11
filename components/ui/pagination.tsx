'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

// ============================================
// Pagination Component
// ============================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  showItemsInfo?: boolean;
  className?: string;
}

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, showItemsInfo = false, className }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate items info
  const getItemsInfo = () => {
    if (!totalItems || !itemsPerPage) return null;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    return `Menampilkan ${startItem}-${endItem} dari ${totalItems}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between gap-4 flex-wrap', className)}>
      {/* Items Info */}
      {showItemsInfo && <div className="text-sm text-gray-500">{getItemsInfo()}</div>}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <div key={`ellipsis-${index}`} className="flex items-center justify-center h-8 w-8">
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </div>
          ) : (
            <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => onPageChange(page)} className={cn('h-8 w-8 p-0', currentPage === page && 'bg-teal-600 hover:bg-teal-700 text-white')}>
              {page}
            </Button>
          ),
        )}

        {/* Next Button */}
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  );
}
