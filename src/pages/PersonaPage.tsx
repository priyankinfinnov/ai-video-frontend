import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';

import { PersonaDataTable } from '@/components/dashboard/persona';
import { DataTableFilterBar, DataTablePagination } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useGetPersonasQuery } from '@/queries/personaQueries';
import { useDeletePersonaMutation } from '@/queries/personaActions';
import { useAppSelector } from '@/store/store';
import useDataTableFilters from '@/hooks/useDataTableFilters';

export const PersonaPage = () => {
  const token = useAppSelector((store) => store.auth.token);
  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
  } = useDataTableFilters({ initialPage: 1, initialLimit: 10 });

  const { data: response, isLoading, isError } = useGetPersonasQuery({
    token,
    page,
    limit,
  });

  const { mutate: deletePersona } = useDeletePersonaMutation();

  const personasList = useMemo(() => response?.data || [], [response?.data]);
  const paginationMeta = response?.pagination;

  // Filter client-side if search query is active
  const filteredPersonas = useMemo(() => {
    if (!debouncedSearch.trim()) return personasList;
    const lower = debouncedSearch.toLowerCase();
    return personasList.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.topics.some((t) => t.toLowerCase().includes(lower))
    );
  }, [personasList, debouncedSearch]);

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this persona?')) {
      deletePersona(id);
    }
  };

  return (
    <main className='flex flex-col gap-6 px-4 md:px-8 py-8 max-w-7xl mx-auto w-full'>
      {/* Header */}
      <header className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-semibold text-gray-900'>
            Personas
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Manage AI creator personas, writing DNA, voice models, and video styles.
          </p>
        </div>

        <Button asChild size='md' className='text-white shrink-0'>
          <Link
            to='/dashboard/persona-form'
            className='flex items-center gap-2 py-2 px-4 text-sm font-medium'
            data-testid='add-persona-button'
          >
            <PlusIcon className='w-4 h-4' />
            <span>Add Persona</span>
          </Link>
        </Button>
      </header>

      {/* Filter and Search Bar */}
      <DataTableFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder='Search personas by name or topic...'
      />

      {/* Error State */}
      {isError && (
        <div className='p-4 rounded-lg bg-error-50 border border-error-200 text-error-700 text-sm'>
          Unable to load personas. Please ensure the backend server is running and try again.
        </div>
      )}

      {/* Table */}
      <PersonaDataTable
        data={filteredPersonas}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {paginationMeta && (
        <DataTablePagination
          pagination={paginationMeta}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}
    </main>
  );
};

export default PersonaPage;
