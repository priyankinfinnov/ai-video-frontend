import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LayersIcon } from 'lucide-react';
import { VideoPart } from '@/types/project';
import { DataTable, DataTableFilterBar, DataTablePagination } from '@/components/common';
import { useGetVideoPartsQuery } from '@/queries/projectQueries';
import { useAppSelector } from '@/store/store';
import useDataTableFilters from '@/hooks/useDataTableFilters';

interface VideoPartsTabProps {
  projectId: number;
}

const getAudioStatusBadge = (status: string) => {
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
  if (upper === 'GENERATING') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
        <span className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
        Generating
      </span>
    );
  }
  return (
    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-700 border border-warning-200'>
      Pending
    </span>
  );
};

export const VideoPartsTab = ({ projectId }: VideoPartsTabProps) => {
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

  const { data: response, isLoading } = useGetVideoPartsQuery({
    token,
    videoProjectId: projectId,
    page,
    limit,
  });

  const partsList = useMemo(() => response?.data || [], [response?.data]);
  const pagination = response?.pagination;

  // Filter client-side by partText if searched
  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return partsList;
    const lower = debouncedSearch.toLowerCase();
    return partsList.filter(
      (p) =>
        p.partText?.toLowerCase().includes(lower) ||
        p.ttsText?.toLowerCase().includes(lower) ||
        String(p.sequenceNumber).includes(lower)
    );
  }, [partsList, debouncedSearch]);

  const columns = useMemo<ColumnDef<VideoPart>[]>(
    () => [
      {
        accessorKey: 'sequenceNumber',
        header: 'Part #',
        cell: ({ row }) => (
          <span className='inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-50 text-primary-700 text-xs font-bold border border-primary-200'>
            {row.getValue('sequenceNumber')}
          </span>
        ),
      },
      {
        accessorKey: 'partText',
        header: 'Part Script',
        cell: ({ row }) => {
          const text = (row.getValue('partText') as string) || '';
          return (
            <div className='max-w-md text-xs text-gray-900 leading-relaxed font-normal'>
              {text}
            </div>
          );
        },
      },
      {
        accessorKey: 'ttsText',
        header: 'TTS Rewrite',
        cell: ({ row }) => {
          const text = (row.getValue('ttsText') as string) || '';
          return (
            <div className='max-w-xs text-xs text-gray-600 italic truncate' title={text}>
              {text || <span className='text-gray-400 not-italic'>Identical to part script</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'audioStatus',
        header: 'Audio Status',
        cell: ({ row }) => getAudioStatusBadge(row.getValue('audioStatus')),
      },
      {
        accessorKey: 'audioDuration',
        header: 'Duration',
        cell: ({ row }) => {
          const dur = row.getValue('audioDuration') as number | null;
          return dur ? (
            <span className='text-xs font-mono text-gray-700 font-medium'>
              {dur.toFixed(1)}s
            </span>
          ) : (
            <span className='text-xs text-gray-400 italic'>--</span>
          );
        },
      },
      {
        accessorKey: 'audioGenSec',
        header: 'TTS Gen Sec',
        cell: ({ row }) => {
          const sec = row.getValue('audioGenSec') as number | null;
          return sec ? (
            <span className='text-xs font-mono text-gray-600'>
              {sec.toFixed(2)}s
            </span>
          ) : (
            <span className='text-xs text-gray-400 italic'>--</span>
          );
        },
      },
      {
        accessorKey: 'retryCount',
        header: 'Retries',
        cell: ({ row }) => {
          const retries = row.getValue('retryCount') as number;
          return (
            <span className={`text-xs font-mono ${retries > 0 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
              {retries}
            </span>
          );
        },
      },
      {
        id: 'audioPreview',
        header: 'Audio Track',
        cell: ({ row }) => {
          const audioPath = row.original.audioPath;
          if (!audioPath) {
            return <span className='text-xs text-gray-400 italic'>Pending audio</span>;
          }
          // If audioPath is in storage, convert relative path to backend static url
          const normalizedPath = audioPath.replace(/\\/g, '/');
          const cleanPath = normalizedPath.includes('storage/')
            ? normalizedPath.substring(normalizedPath.indexOf('storage/'))
            : normalizedPath;
          const audioUrl = `http://localhost:6001/${cleanPath}`;

          return (
            <div className='flex items-center gap-2'>
              <audio controls className='h-7 w-40 text-xs'>
                <source src={audioUrl} type='audio/mpeg' />
                <source src={audioUrl} type='audio/wav' />
              </audio>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
        <div>
          <h3 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
            <LayersIcon className='w-4 h-4 text-primary-600' />
            Video Parts Pipeline
          </h3>
          <p className='text-xs text-gray-500 mt-0.5'>
            Sequential script partitions and their corresponding audio voiceover tracks.
          </p>
        </div>

        <DataTableFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder='Filter by script text or sequence...'
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        emptyMessage='No video parts generated yet for this project. Parts will appear as script splitting completes.'
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

export default VideoPartsTab;
