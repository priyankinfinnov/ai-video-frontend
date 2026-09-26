import { ReactNode } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface DataTableFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  extraFilters?: ReactNode;
  actions?: ReactNode;
}

export const DataTableFilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  extraFilters,
  actions,
}: DataTableFilterBarProps) => {
  return (
    <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
      <div className='flex flex-1 items-center gap-3'>
        <div className='relative flex-1 sm:max-w-xs'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className='pl-9 pr-8 h-10 w-full text-sm'
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              aria-label='Clear search'
            >
              <XIcon className='h-4 w-4' />
            </button>
          )}
        </div>
        {extraFilters}
      </div>

      {actions && <div className='flex items-center gap-2'>{actions}</div>}
    </div>
  );
};

export default DataTableFilterBar;
