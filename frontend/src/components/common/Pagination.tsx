import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark px-2 py-3.5 mt-2">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Page {page + 1} of {totalPages} &middot; {totalElements} total
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button variant="secondary" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
