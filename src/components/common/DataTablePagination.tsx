import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '@/types/common';

interface DataTablePaginationProps {
  pagination?: PaginationMeta;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  pageSizeOptions?: number[];
}

export const DataTablePagination = ({
  pagination,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationProps) => {
  if (!pagination) {
    return null;
  }

  const { page, limit, totalCount, totalPages, hasNextPage, hasPrevPage } =
    pagination;

  const startEntry = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, totalCount);

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-1 text-sm text-gray-700'>
      <div className='flex items-center gap-2 text-sm text-gray-600'>
        <span>
          Showing <span className='font-medium text-gray-900'>{startEntry}</span> to{' '}
          <span className='font-medium text-gray-900'>{endEntry}</span> of{' '}
          <span className='font-medium text-gray-900'>{totalCount}</span> results
        </span>
      </div>

      <div className='flex items-center gap-6'>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-gray-500 whitespace-nowrap'>Rows per page:</span>
          <Select
            value={limit.toString()}
            onValueChange={(val) => onLimitChange(Number(val))}
          >
            <SelectTrigger className='h-8 w-[72px] text-xs'>
              <SelectValue placeholder={limit.toString()} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()} className='text-xs'>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-xs text-gray-500'>
            Page {page} of {Math.max(totalPages, 1)}
          </span>
          <div className='flex items-center gap-1'>
            <Button
              variant='secondary-gray'
              size='sm'
              className='h-8 w-8 p-0'
              disabled={!hasPrevPage && page <= 1}
              onClick={() => onPageChange(page - 1)}
              aria-label='Previous Page'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='secondary-gray'
              size='sm'
              className='h-8 w-8 p-0'
              disabled={!hasNextPage && page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label='Next Page'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTablePagination;
