import { useState, useEffect } from 'react';

interface UseDataTableFiltersOptions {
  initialPage?: number;
  initialLimit?: number;
  debounceMs?: number;
}

export function useDataTableFilters({
  initialPage = 1,
  initialLimit = 10,
  debounceMs = 300,
}: UseDataTableFiltersOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [search, debounceMs]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to page 1 on new search
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to page 1 on limit change
  };

  const resetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setPage(initialPage);
    setLimit(initialLimit);
  };

  return {
    page,
    setPage,
    limit,
    setLimit: handleLimitChange,
    search,
    setSearch: handleSearchChange,
    debouncedSearch,
    resetFilters,
  };
}

export default useDataTableFilters;
