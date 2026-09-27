import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  FilmIcon,
  SparklesIcon,
  AlertCircleIcon,
  ExternalLinkIcon,
  Youtube,
  Instagram,
  LayoutGrid,
  List,
  Filter,
  Play,
} from 'lucide-react';
import { ShortsClip, ShortsClipStatus } from '@/types/project';
import { DataTable, DataTableFilterBar, DataTablePagination } from '@/components/common';
import { useGetShortsClipsQuery } from '@/queries/projectQueries';
import { useAppSelector } from '@/store/store';
import useDataTableFilters from '@/hooks/useDataTableFilters';
import { getCreatedDate } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { ShortClipCard } from './ShortClipCard';
import { ShortClipModal } from './ShortClipModal';

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

const getSocialStatusBadge = (
  status?: string | null,
  url?: string | null,
  platform: 'YOUTUBE' | 'INSTAGRAM' = 'YOUTUBE'
) => {
  const upper = (status || 'NOT_UPLOADED').toUpperCase();

  if (upper === 'PUBLISHED') {
    return (
      <div className='flex items-center gap-1.5'>
        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'>
          {platform === 'YOUTUBE' ? (
            <Youtube className='w-3 h-3 text-red-600' />
          ) : (
            <Instagram className='w-3 h-3 text-pink-600' />
          )}
          Published
        </span>
        {url && (
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className={`p-1 rounded hover:bg-gray-100 transition-colors ${
              platform === 'YOUTUBE'
                ? 'text-red-600 hover:text-red-700'
                : 'text-pink-600 hover:text-pink-700'
            }`}
            title={`View on ${
              platform === 'YOUTUBE' ? 'YouTube Shorts' : 'Instagram Reels'
            }`}
          >
            <ExternalLinkIcon className='w-3.5 h-3.5' />
          </a>
        )}
      </div>
    );
  }

  if (upper === 'SCHEDULED') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200'>
        <span className='w-1.5 h-1.5 rounded-full bg-purple-500' />
        Scheduled
      </span>
    );
  }

  if (upper === 'UPLOADING') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
        <span className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
        Uploading...
      </span>
    );
  }

  if (upper === 'FAILED') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200'>
        Failed
      </span>
    );
  }

  return (
    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500'>
      Not Uploaded
    </span>
  );
};

export const ShortsClipsTab = ({ projectId }: ShortsClipsTabProps) => {
  const token = useAppSelector((store) => store.auth.token);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activePlayingId, setActivePlayingId] = useState<number | null>(null);
  const [selectedClipForModal, setSelectedClipForModal] = useState<ShortsClip | null>(null);

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

  // Filter client-side by title/viralityReason/status if searched or filtered
  const filteredData = useMemo(() => {
    return clipsList.filter((c) => {
      // Status filter
      if (statusFilter !== 'ALL' && c.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (!debouncedSearch.trim()) return true;
      const lower = debouncedSearch.toLowerCase();
      return (
        c.title?.toLowerCase().includes(lower) ||
        c.viralityReason?.toLowerCase().includes(lower) ||
        c.shortsTranscript?.toLowerCase().includes(lower) ||
        String(c.id).includes(lower)
      );
    });
  }, [clipsList, debouncedSearch, statusFilter]);

  const handleTogglePlay = (clipId: number) => {
    setActivePlayingId((prev) => (prev === clipId ? null : clipId));
  };

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
        id: 'youtubePublishing',
        header: 'YouTube Shorts',
        cell: ({ row }) =>
          getSocialStatusBadge(
            row.original.youtubeStatus,
            row.original.youtubeUrl,
            'YOUTUBE'
          ),
      },
      {
        id: 'instagramPublishing',
        header: 'Instagram Reels',
        cell: ({ row }) =>
          getSocialStatusBadge(
            row.original.instagramStatus,
            row.original.instagramUrl,
            'INSTAGRAM'
          ),
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
            <div className='flex items-center gap-2'>
              <video
                src={videoUrl}
                className='w-16 h-24 object-cover rounded-md border border-gray-200 shadow-xs cursor-pointer'
                onClick={() => setSelectedClipForModal(clip)}
              />
              <Button
                variant='tertiary-gray'
                size='sm'
                onClick={() => setSelectedClipForModal(clip)}
                className='h-8 w-8 p-0 text-gray-500 hover:text-primary-600'
                title='Inspect Clip'
              >
                <Play className='w-4 h-4' />
              </Button>
            </div>
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
      {/* Header with Title, Search, Filter, and View Switcher */}
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-1 border-b border-gray-100'>
        <div>
          <div className='flex items-center gap-2'>
            <FilmIcon className='w-4 h-4 text-primary-600' />
            <h3 className='text-sm font-semibold text-gray-900'>
              Shorts Viral Clips
            </h3>
            {clipsList.length > 0 && (
              <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200'>
                {clipsList.length} {clipsList.length === 1 ? 'Clip' : 'Clips'}
              </span>
            )}
          </div>
          <p className='text-xs text-gray-500 mt-0.5'>
            Carved vertical 9:16 clips with subtitled voiceover and hook rationale.
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className='flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-start md:justify-end'>
          {/* Status Dropdown Filter */}
          <div className='flex items-center gap-1.5'>
            <Filter className='w-3.5 h-3.5 text-gray-400' />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='text-xs font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 shadow-2xs'
            >
              <option value='ALL'>All Statuses</option>
              <option value='COMPLETED'>Completed</option>
              <option value='BURNING_SUBTITLES_IN_PROGRESS'>Burning Subtitles</option>
              <option value='CARVING_IN_PROGRESS'>Carving Clip</option>
              <option value='FAILED'>Failed</option>
              <option value='PENDING'>Pending</option>
            </select>
          </div>

          {/* Search Filter Bar */}
          <div className='flex-1 sm:w-64 md:w-72'>
            <DataTableFilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder='Filter by title, reason, or script...'
            />
          </div>

          {/* View Toggle: Grid vs Table */}
          <div className='flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200'>
            <button
              type='button'
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-700 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title='Clips Gallery Grid'
              data-testid='clips-view-grid'
            >
              <LayoutGrid className='w-3.5 h-3.5' />
              <span>Clips</span>
            </button>
            <button
              type='button'
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-primary-700 shadow-2xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title='Tabular Data View'
              data-testid='clips-view-table'
            >
              <List className='w-3.5 h-3.5' />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'grid' ? (
        <div>
          {isLoading ? (
            /* Skeleton Loading Grid */
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5'>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className='bg-white rounded-2xl border border-gray-200 p-3 flex flex-col gap-3 animate-pulse shadow-xs'
                >
                  <div className='w-full aspect-[9/16] bg-gray-200 rounded-xl' />
                  <div className='h-4 bg-gray-200 rounded w-3/4' />
                  <div className='h-3 bg-gray-100 rounded w-1/2' />
                </div>
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            /* Empty State */
            <div className='text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 max-w-2xl mx-auto space-y-3'>
              <div className='w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto'>
                <FilmIcon className='w-6 h-6' />
              </div>
              <h4 className='text-sm font-semibold text-gray-900'>No Short Clips Found</h4>
              <p className='text-xs text-gray-500 max-w-md mx-auto'>
                {search || statusFilter !== 'ALL'
                  ? 'No clips match your current search or status filter. Try clearing the filter.'
                  : 'No clips generated yet for this project. Once a shorts pipeline executes, your carved 9:16 vertical clips will appear here ready to preview and publish.'}
              </p>
              {(search || statusFilter !== 'ALL') && (
                <Button
                  variant='secondary-gray'
                  size='sm'
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('ALL');
                  }}
                  className='text-xs mt-2'
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            /* Responsive Clips Gallery Grid */
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5'>
              {filteredData.map((clip) => (
                <ShortClipCard
                  key={clip.id}
                  clip={clip}
                  onInspect={(c) => setSelectedClipForModal(c)}
                  isPlaying={activePlayingId === clip.id}
                  onTogglePlay={handleTogglePlay}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Tabular Data View */
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          emptyMessage='No clips generated yet for this project. Once a shorts pipeline runs, carved vertical clips will appear here.'
        />
      )}

      {/* Pagination (applies to both Grid and Table view) */}
      {pagination && (
        <DataTablePagination
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      {/* Full Detailed Inspector Modal */}
      <ShortClipModal
        clip={selectedClipForModal}
        onClose={() => setSelectedClipForModal(null)}
      />
    </div>
  );
};

export default ShortsClipsTab;
