import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FilmIcon, SparklesIcon, AlertCircleIcon } from 'lucide-react';
import { ShortsClip, ShortsClipStatus } from '@/types/project';
import { DataTable, DataTableFilterBar, DataTablePagination } from '@/components/common';
import { useGetShortsClipsQuery } from '@/queries/projectQueries';
import { useAppSelector } from '@/store/store';
import useDataTableFilters from '@/hooks/useDataTableFilters';
import { getCreatedDate } from '@/utils/utils';

interface ShortsClipsTabProps {
  projectId: number;
}

const getClipStatusBadge = (status: ShortsClipStatus | string) => {
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
  if (upper === 'BURNING_SUBTITLES_IN_PROGRESS') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200'>
        <span className='w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse' />
        Burning Subtitles
      </span>
    );
  }
  if (upper === 'CARVING_IN_PROGRESS') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
        <span className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
        Carving Clip
      </span>
    );
  }
  return (
    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-700 border border-warning-200'>
      Pending
    </span>
  );
};

export const ShortsClipsTab = ({ projectId }: ShortsClipsTabProps) => {
  const token = useAppSelector((store) => store.auth.token);

  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
  } = useDataTableFilters({ initialPage: 1, initialLimit: 50 });

  const { data: response, isLoading } = useGetShortsClipsQuery({
    token,
    videoProjectId: projectId,
    page,
    limit,
  });

  const clipsList = useMemo(() => response?.data || [], [response?.data]);
  const pagination = response?.pagination;

  // Filter client-side by title/viralityReason if searched
  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return clipsList;
    const lower = debouncedSearch.toLowerCase();
    return clipsList.filter(
      (c) =>
        c.title?.toLowerCase().includes(lower) ||
        c.viralityReason?.toLowerCase().includes(lower) ||
        c.shortsTranscript?.toLowerCase().includes(lower) ||
        String(c.id).includes(lower)
    );
  }, [clipsList, debouncedSearch]);

  const columns = useMemo<ColumnDef<ShortsClip>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Clip ID',
        cell: ({ row }) => (
          <span className='font-mono text-xs text-gray-500'>
            #{row.getValue('id')}
          </span>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Hook Title',
        cell: ({ row }) => {
          const title = (row.getValue('title') as string) || 'Untitled Clip';
          return (
            <div className='max-w-xs font-medium text-xs text-gray-900 leading-snug'>
              {title}
            </div>
          );
        },
      },
      {
        accessorKey: 'viralityReason',
        header: 'Virality Angle / Hook Reason',
        cell: ({ row }) => {
          const reason = (row.getValue('viralityReason') as string) || '';
          return (
            <div className='max-w-sm text-xs text-gray-700 leading-relaxed truncate' title={reason}>
              {reason ? (
                <span className='flex items-center gap-1.5'>
                  <SparklesIcon className='w-3.5 h-3.5 text-amber-500 shrink-0' />
                  <span className='truncate'>{reason}</span>
                </span>
              ) : (
                <span className='text-gray-400 italic'>--</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getClipStatusBadge(row.getValue('status')),
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        cell: ({ row }) => {
          const dur = row.getValue('duration') as number | null;
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
        accessorKey: 'renderSec',
        header: 'Render Sec',
        cell: ({ row }) => {
          const sec = row.getValue('renderSec') as number | null;
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
        id: 'videoPreview',
        header: 'Clip Preview',
        cell: ({ row }) => {
          const clip = row.original;
          const videoPath = clip.videoPath || clip.rawVideoPath;
          if (!videoPath) {
            return (
              <span className='text-xs text-gray-400 italic'>
                {clip.status === 'FAILED' ? (
                  <span className='flex items-center gap-1 text-error-600' title={clip.errorMessage || 'Rendering failed'}>
                    <AlertCircleIcon className='w-3.5 h-3.5' /> Failed
                  </span>
                ) : (
                  'Rendering...'
                )}
              </span>
            );
          }

          const normalizedPath = videoPath.replace(/\\/g, '/');
          const cleanPath = normalizedPath.includes('storage/')
            ? normalizedPath.substring(normalizedPath.indexOf('storage/'))
            : normalizedPath;
          const videoUrl = `http://localhost:6001/${cleanPath}`;

          return (
            <video
              src={videoUrl}
              className='w-16 h-24 object-cover rounded-md border border-gray-200 shadow-xs'
              controls
            />
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
    []
  );

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
        <div>
          <h3 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
            <FilmIcon className='w-4 h-4 text-primary-600' />
            Shorts Viral Clips
          </h3>
          <p className='text-xs text-gray-500 mt-0.5'>
            Carved vertical 9:16 clips with subtitled voiceover and hook rationale.
          </p>
        </div>

        <DataTableFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder='Filter by title or virality reason...'
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        emptyMessage='No clips generated yet for this project. Once a shorts pipeline runs, carved vertical clips will appear here.'
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

export default ShortsClipsTab;
