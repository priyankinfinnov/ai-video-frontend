import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Trash2Icon, FilmIcon, PenIcon } from 'lucide-react';
import { ShortsProject } from '@/types/project';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { getCreatedDate } from '@/utils/utils';
import { ShortsProjectEditModal } from './ShortsProjectEditModal';

interface ShortsDataTableProps {
  data: ShortsProject[];
  isLoading?: boolean;
  onDelete?: (id: number) => void;
}

const getStatusBadge = (status: string) => {
  const upper = status.toUpperCase();
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

export const ShortsDataTable = ({
  data,
  isLoading = false,
  onDelete,
}: ShortsDataTableProps) => {
  const navigate = useNavigate();
  const [selectedShortsForEdit, setSelectedShortsForEdit] =
    useState<ShortsProject | null>(null);

  const columns = useMemo<ColumnDef<ShortsProject>[]>(
    () => [
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const shorts = row.original;
          return (
            <div
              className='flex items-center gap-1.5'
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant='tertiary-gray'
                size='sm'
                onClick={() => setSelectedShortsForEdit(shorts)}
                className='h-8 w-8 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg'
                title='Edit Shorts Project Status'
                data-testid={`edit-shorts-${shorts.id}`}
              >
                <PenIcon className='h-4 w-4' />
              </Button>

              {onDelete && (
                <Button
                  variant='tertiary-gray'
                  size='sm'
                  onClick={() => onDelete(shorts.id)}
                  className='h-8 w-8 p-0 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-lg'
                  title='Delete Shorts Project'
                  data-testid={`delete-shorts-${shorts.id}`}
                >
                  <Trash2Icon className='h-4 w-4' />
                </Button>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <span className='font-mono text-xs text-gray-500'>
            #{row.getValue('id')}
          </span>
        ),
      },
      {
        accessorKey: 'videoProjectId',
        header: 'Source Project',
        cell: ({ row }) => {
          const projectId = row.getValue('videoProjectId') as number;
          const parentPrompt = row.original.videoProject?.rawInputText;
          return (
            <div className='flex flex-col gap-0.5'>
              <div className='flex items-center gap-1.5'>
                <FilmIcon className='w-3.5 h-3.5 text-primary-500' />
                <span className='font-semibold text-xs text-gray-900'>
                  Project #{projectId}
                </span>
              </div>
              {parentPrompt && (
                <span className='text-xs text-gray-500 truncate max-w-xs'>
                  {parentPrompt}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.getValue('status') || 'PENDING'),
      },
      {
        id: 'clipsCount',
        header: 'Clips',
        cell: ({ row }) => {
          const count = row.original.clips?.length || 0;
          return (
            <span className='inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700'>
              {count} {count === 1 ? 'clip' : 'clips'}
            </span>
          );
        },
      },
      {
        accessorKey: 'totalRenderSec',
        header: 'Render Time',
        cell: ({ row }) => {
          const sec = row.getValue('totalRenderSec') as number | null;
          return (
            <span className='text-xs text-gray-600 font-mono'>
              {sec !== null && sec !== undefined ? `${sec}s` : '—'}
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
    [onDelete]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage='No short-form video projects found. Generate shorts from any video project.'
        onRowClick={(shorts) => {
          if (shorts.videoProjectId) {
            navigate(`/dashboard/projects/${shorts.videoProjectId}?tab=shorts-clips`);
          }
        }}
      />

      <ShortsProjectEditModal
        shortsProject={selectedShortsForEdit}
        isOpen={!!selectedShortsForEdit}
        onClose={() => setSelectedShortsForEdit(null)}
      />
    </>
  );
};
