import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ImageIcon, FilmIcon, UserIcon, VideoIcon, SparklesIcon, ExternalLinkIcon } from 'lucide-react';
import { VideoPartAsset, AssetType } from '@/types/project';
import { DataTable, DataTableFilterBar, DataTablePagination } from '@/components/common';
import { useGetVideoPartAssetsQuery } from '@/queries/projectQueries';
import { useAppSelector } from '@/store/store';
import useDataTableFilters from '@/hooks/useDataTableFilters';

interface VideoPartAssetsTabProps {
  projectId: number;
}

const getAssetTypeBadge = (type: AssetType) => {
  switch (type) {
    case 'IMAGE':
      return (
        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200'>
          <ImageIcon className='w-3 h-3' />
          Image
        </span>
      );
    case 'VIDEO':
      return (
        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
          <FilmIcon className='w-3 h-3' />
          Video
        </span>
      );
    case 'TALKING_HEAD':
      return (
        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200'>
          <UserIcon className='w-3 h-3' />
          Talking Head
        </span>
      );
    case 'REMOTION':
      return (
        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'>
          <VideoIcon className='w-3 h-3' />
          Remotion
        </span>
      );
    default:
      return (
        <span className='inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700'>
          {type}
        </span>
      );
  }
};

const getAssetStatusBadge = (status: string) => {
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

export const VideoPartAssetsTab = ({ projectId }: VideoPartAssetsTabProps) => {
  const token = useAppSelector((store) => store.auth.token);
  const [selectedPartFilter, setSelectedPartFilter] = useState<string>('all');

  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
  } = useDataTableFilters({ initialPage: 1, initialLimit: 50 });

  const { data: response, isLoading } = useGetVideoPartAssetsQuery({
    token,
    videoProjectId: projectId,
    videoPartId: selectedPartFilter !== 'all' ? selectedPartFilter : undefined,
    page,
    limit,
  });

  const assetsList = useMemo(() => response?.data || [], [response?.data]);
  const pagination = response?.pagination;

  // Filter client-side by prompt if searched
  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return assetsList;
    const lower = debouncedSearch.toLowerCase();
    return assetsList.filter(
      (a) =>
        a.prompt?.toLowerCase().includes(lower) ||
        a.generationPromptText?.toLowerCase().includes(lower) ||
        String(a.videoPartId).includes(lower) ||
        a.assetType?.toLowerCase().includes(lower)
    );
  }, [assetsList, debouncedSearch]);

  const columns = useMemo<ColumnDef<VideoPartAsset>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Asset ID',
        cell: ({ row }) => (
          <span className='font-mono text-xs text-gray-500'>
            #{row.getValue('id')}
          </span>
        ),
      },
      {
        accessorKey: 'videoPartId',
        header: 'Part #',
        cell: ({ row }) => (
          <span className='inline-flex items-center justify-center px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs font-medium'>
            Part {row.getValue('videoPartId')}
          </span>
        ),
      },
      {
        accessorKey: 'assetType',
        header: 'Type',
        cell: ({ row }) => getAssetTypeBadge(row.getValue('assetType')),
      },
      {
        accessorKey: 'prompt',
        header: 'Prompt / Visual Direction',
        cell: ({ row }) => {
          const prompt = (row.getValue('prompt') as string) || (row.original.generationPromptText as string) || '';
          return (
            <div className='max-w-xs md:max-w-md text-xs text-gray-800 font-normal leading-relaxed truncate' title={prompt}>
              {prompt || <span className='text-gray-400 italic'>No prompt specified</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getAssetStatusBadge(row.getValue('status')),
      },
      {
        accessorKey: 'desiredDuration',
        header: 'Duration',
        cell: ({ row }) => {
          const dur = row.getValue('desiredDuration') as number | null;
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
        accessorKey: 'genSec',
        header: 'Gen Sec',
        cell: ({ row }) => {
          const sec = row.getValue('genSec') as number | null;
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
        id: 'preview',
        header: 'Media Preview',
        cell: ({ row }) => {
          const path = row.original.path;
          if (!path) {
            return <span className='text-xs text-gray-400 italic'>Generating</span>;
          }

          const normalizedPath = path.replace(/\\/g, '/');
          const cleanPath = normalizedPath.includes('storage/')
            ? normalizedPath.substring(normalizedPath.indexOf('storage/'))
            : normalizedPath;
          const mediaUrl = `http://localhost:6001/${cleanPath}`;
          const isVideo = row.original.assetType === 'VIDEO' || path.endsWith('.mp4');

          return (
            <div className='flex items-center gap-2'>
              {isVideo ? (
                <video
                  src={mediaUrl}
                  className='w-16 h-10 object-cover rounded border border-gray-200'
                  controls
                />
              ) : (
                <a
                  href={mediaUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block relative group'
                  title='Click to view full size'
                >
                  <img
                    src={mediaUrl}
                    alt='Asset preview'
                    className='w-16 h-10 object-cover rounded border border-gray-200 group-hover:opacity-80 transition-opacity'
                  />
                  <ExternalLinkIcon className='w-3 h-3 text-white absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 bg-black/60 rounded p-0.5' />
                </a>
              )}
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
            <SparklesIcon className='w-4 h-4 text-primary-600' />
            Visual & Multimodal Assets
          </h3>
          <p className='text-xs text-gray-500 mt-0.5'>
            Images, video clips, and talking-head scenes generated for each video part.
          </p>
        </div>

        <DataTableFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder='Filter by prompt or asset type...'
          extraFilters={
            <select
              value={selectedPartFilter}
              onChange={(e) => {
                setSelectedPartFilter(e.target.value);
                setPage(1);
              }}
              className='h-10 px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white text-gray-700 shadow-xs'
              aria-label='Filter by Part'
            >
              <option value='all'>All Video Parts</option>
              {Array.from(new Set(assetsList.map((a) => a.videoPartId))).map((pId) => (
                <option key={pId} value={String(pId)}>
                  Part {pId}
                </option>
              ))}
            </select>
          }
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        emptyMessage='No multimodal assets generated yet for this project. Assets will appear as visual generation begins.'
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

export default VideoPartAssetsTab;
