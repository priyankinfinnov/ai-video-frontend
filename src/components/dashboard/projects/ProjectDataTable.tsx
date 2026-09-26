import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { CopyIcon, PenIcon, ScissorsIcon, Trash2Icon, ExternalLinkIcon } from 'lucide-react';
import { VideoProject, ProjectType } from '@/types/project';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { getCreatedDate } from '@/utils/utils';


interface ProjectDataTableProps {
  data: VideoProject[];
  isLoading?: boolean;
  onDelete?: (id: number) => void;
}

const TYPE_CONFIG: Record<
  ProjectType,
  { label: string; bgClass: string; textClass: string }
> = {
  FULL_AI_GENERATED_VIDEO: {
    label: 'Full AI Video',
    bgClass: 'bg-primary-50 border-primary-200',
    textClass: 'text-primary-700',
  },
  AUDIOBOOK: {
    label: 'Audiobook',
    bgClass: 'bg-blue-50 border-blue-200',
    textClass: 'text-blue-700',
  },
  TALKING_HEAD_VIDEO: {
    label: 'Talking Head',
    bgClass: 'bg-amber-50 border-amber-200',
    textClass: 'text-amber-700',
  },
  REMOTION_VIDEO: {
    label: 'Remotion',
    bgClass: 'bg-emerald-50 border-emerald-200',
    textClass: 'text-emerald-700',
  },
};

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
  // Processing statuses
  return (
    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
      <span className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
      {status.replace(/_/g, ' ').toLowerCase()}
    </span>
  );
};

export const ProjectDataTable = ({
  data,
  isLoading = false,
  onDelete,
}: ProjectDataTableProps) => {
  const columns = useMemo<ColumnDef<VideoProject>[]>(
    () => [
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const project = row.original;
          return (
            <div className='flex items-center gap-1'>
              <Button
                asChild
                variant='tertiary-gray'
                size='sm'
                className='h-8 w-8 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg'
                title='Edit Project'
              >
                <Link
                  to={`/dashboard/project-form?projectId=${project.id}`}
                  data-testid={`edit-project-${project.id}`}
                >
                  <PenIcon className='h-4 w-4' />
                </Link>
              </Button>

              <Button
                asChild
                variant='tertiary-gray'
                size='sm'
                className='h-8 w-8 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg'
                title='Clone Project'
              >
                <Link
                  to={`/dashboard/project-form?cloneId=${project.id}`}
                  data-testid={`clone-project-${project.id}`}
                >
                  <CopyIcon className='h-4 w-4' />
                </Link>
              </Button>

              <Button
                asChild
                variant='tertiary-gray'
                size='sm'
                className='h-8 w-8 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg'
                title='Create Shorts from Project'
              >
                <Link
                  to={`/dashboard/shorts-form?videoProjectId=${project.id}`}
                  data-testid={`create-shorts-from-${project.id}`}
                >
                  <ScissorsIcon className='h-4 w-4' />
                </Link>
              </Button>

              {onDelete && (
                <Button
                  variant='tertiary-gray'
                  size='sm'
                  onClick={() => onDelete(project.id)}
                  className='h-8 w-8 p-0 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-lg'
                  title='Delete Project'
                  data-testid={`delete-project-${project.id}`}
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
        accessorKey: 'rawInputText',
        header: 'Prompt / Concept',
        cell: ({ row }) => {
          const text = (row.getValue('rawInputText') as string) || '';
          return (
            <div className='max-w-xs md:max-w-sm truncate font-medium text-gray-900' title={text}>
              {text || 'Untitled Project'}
            </div>
          );
        },
      },
      {
        accessorKey: 'personaId',
        header: 'Persona',
        cell: ({ row }) => {
          const personaId = row.getValue('personaId') as number;
          const persona = row.original.persona;
          return (
            <span className='inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700'>
              {persona?.name ? persona.name : `Persona #${personaId}`}
            </span>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const type = (row.getValue('type') as ProjectType) || 'FULL_AI_GENERATED_VIDEO';
          const cfg = TYPE_CONFIG[type] || {
            label: type,
            bgClass: 'bg-gray-50 border-gray-200',
            textClass: 'text-gray-700',
          };
          return (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cfg.bgClass} ${cfg.textClass}`}
            >
              {cfg.label}
            </span>
          );
        },
      },
      {
        id: 'lengthAndLang',
        header: 'Lang / Length',
        cell: ({ row }) => {
          const lang = row.original.language || 'ENGLISH';
          const length = row.original.roughLengthInMins;
          return (
            <span className='text-xs text-gray-600 font-medium'>
              {lang}
              {length ? ` • ${length}m` : ''}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.getValue('status') || 'PENDING'),
      },
      {
        accessorKey: 'isPublished',
        header: 'Publish Status',
        cell: ({ row }) => {
          const isPublished = row.getValue('isPublished') as boolean;
          const link = row.original.publishedLink;
          if (isPublished) {
            return (
              <div className='flex items-center gap-1.5'>
                <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-700 border border-success-200'>
                  Published
                </span>
                {link && (
                  <a
                    href={link}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary-600 hover:text-primary-800'
                    title='Open link'
                  >
                    <ExternalLinkIcon className='w-3.5 h-3.5' />
                  </a>
                )}
              </div>
            );
          }
          return (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
              Draft
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
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage='No video projects found. Click "Add Project" to create your first pipeline.'
    />
  );
};
