import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { ScissorsIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { ShortsProject } from '@/types/project';
import { DataTable, DataTableFilterBar, DataTablePagination } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useGetShortsProjectsQuery } from '@/queries/projectQueries';
import { useDeleteShortsProjectMutation } from '@/queries/projectActions';
import { useAppSelector } from '@/store/store';
import useDataTableFilters from '@/hooks/useDataTableFilters';
import { getCreatedDate } from '@/utils/utils';

interface ShortsProjectsTabProps {
  projectId: number;
}

const getShortsStatusBadge = (status: string) => {
  const upper = (status || '').toUpperCase();
  if (upper === 'COMPLETED') {
    return (
      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-700 border border-success-200'>
        Completed
      </span>
    );
  }
  if (upper === 'FAILED') {
    return (
      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-error-50 text-error-700 border border-error-200'>
        Failed
      </span>
    );
  }
  if (upper === 'PENDING') {
    return (
      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-700 border border-warning-200'>
        Pending
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
      <span className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
      {status.replace(/_/g, ' ').toLowerCase()}
    </span>
  );
};

export const ShortsProjectsTab = ({ projectId }: ShortsProjectsTabProps) => {
  const token = useAppSelector((store) => store.auth.token);
  const { mutate: deleteShortsProject } = useDeleteShortsProjectMutation();

  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
  } = useDataTableFilters({ initialPage: 1, initialLimit: 10 });

  const { data: response, isLoading } = useGetShortsProjectsQuery({
    token,
    videoProjectId: projectId,
    page,
    limit,
  });

  const shortsList = useMemo(() => response?.data || [], [response?.data]);
  const pagination = response?.pagination;

  // Filter client-side by transcript/status if searched
  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return shortsList;
    const lower = debouncedSearch.toLowerCase();
    return shortsList.filter(
      (s) =>
        s.status?.toLowerCase().includes(lower) ||
        s.transcript?.toLowerCase().includes(lower) ||
        String(s.id).includes(lower)
    );
  }, [shortsList, debouncedSearch]);

  const columns = useMemo<ColumnDef<ShortsProject>[]>(
    () => [
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className='flex items-center gap-1'>
              <Button
                variant='tertiary-gray'
                size='sm'
                onClick={() => deleteShortsProject(s.id)}
                className='h-8 w-8 p-0 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-lg'
                title='Delete Shorts Project'
              >
                <Trash2Icon className='h-4 w-4' />
              </Button>
            </div>
          );
        },
      },
      {
        accessorKey: 'id',
        header: 'Shorts ID',
        cell: ({ row }) => (
          <span className='font-mono text-xs text-gray-500'>
            #{row.getValue('id')}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getShortsStatusBadge(row.getValue('status')),
      },
      {
        accessorKey: 'transcript',
        header: 'Whisper Transcript Excerpt',
        cell: ({ row }) => {
          const text = (row.getValue('transcript') as string) || '';
          return (
            <div className='max-w-md text-xs text-gray-800 leading-relaxed font-normal truncate' title={text}>
              {text || <span className='text-gray-400 italic'>Transcribing audio...</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'totalRenderSec',
        header: 'Render Time',
        cell: ({ row }) => {
          const sec = row.getValue('totalRenderSec') as number | null;
          return sec ? (
            <span className='text-xs font-mono text-gray-700 font-medium'>
              {sec.toFixed(1)}s
            </span>
          ) : (
            <span className='text-xs text-gray-400 italic'>--</span>
          );
        },
      },
      {
        id: 'clipsCount',
        header: 'Clips',
        cell: ({ row }) => {
          const clips = row.original.clips;
          const count = Array.isArray(clips) ? clips.length : 0;
          return (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
              {count} {count === 1 ? 'clip' : 'clips'}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className='text-xs text-gray-500 whitespace-nowrap'>
            {getCreatedDate(row.getValue('createdAt'))}
          </span>
        ),
      },
    ],
    [deleteShortsProject]
  );

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
        <div>
          <h3 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
            <ScissorsIcon className='w-4 h-4 text-primary-600' />
            Shorts Pipelines for Project #{projectId}
          </h3>
          <p className='text-xs text-gray-500 mt-0.5'>
            Short-form conversions, transcription logs, and LLM viral segment detection.
          </p>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap'>
          <DataTableFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder='Filter shorts projects...'
          />
          <Button
            asChild
            size='sm'
            className='bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1.5 text-xs'
          >
            <Link to={`/dashboard/shorts-form?videoProjectId=${projectId}`}>
              <PlusIcon className='w-3.5 h-3.5' />
              Convert to Shorts
            </Link>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        emptyMessage='No shorts projects created for this video project yet. Click "Convert to Shorts" to carve viral clips.'
      />

      {pagination && (
        <DataTablePagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}
    </div>
  );
};

export default ShortsProjectsTab;
