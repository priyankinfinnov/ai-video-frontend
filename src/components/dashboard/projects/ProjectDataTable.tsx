import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import {
  CopyIcon,
  PenIcon,
  ScissorsIcon,
  Trash2Icon,
  ExternalLinkIcon,
  EyeIcon,
  Youtube,
  Loader2,
} from 'lucide-react';
import { VideoProject, ProjectType } from '@/types/project';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { getCreatedDate } from '@/utils/utils';
import { ProjectUploadModal } from './ProjectUploadModal';


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

const getYoutubeStatusBadge = (
  project: VideoProject,
  onUpload?: (project: VideoProject) => void
) => {
  const status = (project.youtubeStatus || 'NOT_UPLOADED').toUpperCase();
  const studioUrl = project.youtubeStudioUrl;
  const youtubeUrl = project.youtubeUrl;
  const isCompleted = project.status === 'COMPLETED';

  if (status === 'PUBLISHED') {
    return (
      <div className='flex items-center gap-1.5'>
        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'>
          <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
          Published
        </span>
        {youtubeUrl && (
          <a
            href={youtubeUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='p-1 rounded text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors'
            title='Watch on YouTube'
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLinkIcon className='w-3.5 h-3.5' />
          </a>
        )}
      </div>
    );
  }

  if (status === 'DRAFT') {
    return (
      <div className='flex items-center gap-1.5'>
        <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
          <span className='w-1.5 h-1.5 rounded-full bg-blue-500' />
          Studio Draft
        </span>
        {studioUrl && (
          <a
            href={studioUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors'
            title='Edit draft in YouTube Studio'
            onClick={(e) => e.stopPropagation()}
          >
            Studio
            <ExternalLinkIcon className='w-3 h-3' />
          </a>
        )}
      </div>
    );
  }

  if (status === 'SCHEDULED') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200'>
        <span className='w-1.5 h-1.5 rounded-full bg-purple-500' />
        Scheduled
      </span>
    );
  }

  if (status === 'UPLOADING') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
        <span className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
        Uploading...
      </span>
    );
  }

  if (status === 'FAILED') {
    return (
      <div className='flex items-center gap-1.5'>
        <span
          className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200'
          title={project.youtubeErrorMessage || 'Upload failed'}
        >
          Failed
        </span>
        {isCompleted && onUpload && (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              onUpload(project);
            }}
            className='px-2 py-0.5 rounded text-[11px] font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer'
            title='Retry direct upload'
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className='flex items-center gap-1.5'>
      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500'>
        Not Uploaded
      </span>
      {isCompleted && onUpload && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onUpload(project);
          }}
          className='inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer'
          title='Directly upload video to YouTube'
        >
          <Youtube className='w-3 h-3 text-red-600' />
          Upload
        </button>
      )}
    </div>
  );
};

export const ProjectDataTable = ({
  data,
  isLoading = false,
  onDelete,
}: ProjectDataTableProps) => {
  const [selectedProjectForUpload, setSelectedProjectForUpload] = useState<VideoProject | null>(null);

  const columns = useMemo<ColumnDef<VideoProject>[]>(
    () => [
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const project = row.original;
          const isCompleted = project.status === 'COMPLETED';
          const isUploading = project.youtubeStatus === 'UPLOADING';

          return (
            <div className='flex items-center gap-1' onClick={(e) => e.stopPropagation()}>
              <Button
                asChild
                variant='tertiary-gray'
                size='sm'
                className='h-8 w-8 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg'
                title='View Project Details'
              >
                <Link
                  to={`/dashboard/projects/${project.id}`}
                  data-testid={`view-project-${project.id}`}
                >
                  <EyeIcon className='h-4 w-4' />
                </Link>
              </Button>

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

              <Button
                variant='tertiary-gray'
                size='sm'
                onClick={() => setSelectedProjectForUpload(project)}
                disabled={!isCompleted || isUploading}
                className={`h-8 w-8 p-0 rounded-lg ${
                  isUploading
                    ? 'text-blue-500 bg-blue-50 cursor-wait'
                    : isCompleted
                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    : 'text-gray-300 hover:bg-transparent cursor-not-allowed'
                }`}
                title={
                  isUploading
                    ? 'Uploading to YouTube...'
                    : !isCompleted
                    ? `Upload requires COMPLETED status (current: ${project.status})`
                    : 'Upload directly to YouTube'
                }
                data-testid={`upload-project-${project.id}`}
              >
                {isUploading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Youtube className='h-4 w-4' />
                )}
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
          const text =
            (row.getValue('rawInputText') as string) ||
            row.original.generatedScript ||
            '';
          return (
            <div
              className='max-w-xs md:max-w-sm truncate font-medium text-gray-900'
              title={text}
            >
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
        id: 'youtubePublishing',
        header: 'YouTube Publishing',
        cell: ({ row }) =>
          getYoutubeStatusBadge(row.original, (p) => setSelectedProjectForUpload(p)),
      },
      {
        accessorKey: 'isPublished',
        header: 'Publish Status',
        cell: ({ row }) => {
          const isPublished = row.getValue('isPublished') as boolean;
          const link = row.original.publishedLink;
          const formattedLink = link
            ? link.startsWith('http://') || link.startsWith('https://')
              ? link
              : `https://${link}`
            : null;

          if (isPublished) {
            return (
              <div className='flex items-center gap-1.5'>
                <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-700 border border-success-200'>
                  Published
                </span>
                {formattedLink && (
                  <a
                    href={formattedLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary-600 hover:text-primary-800'
                    title='Open published link'
                  >
                    <ExternalLinkIcon className='w-3.5 h-3.5' />
                  </a>
                )}
              </div>
            );
          }
          return (
            <div className='flex items-center gap-1.5'>
              <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
                Draft
              </span>
              {formattedLink && (
                <a
                  href={formattedLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary-600 hover:text-primary-800'
                  title='Open saved link'
                >
                  <ExternalLinkIcon className='w-3.5 h-3.5' />
                </a>
              )}
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
    [onDelete]
  );

  const navigate = useNavigate();

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        onRowClick={(project) => navigate(`/dashboard/projects/${project.id}`)}
        emptyMessage='No video projects found. Click "Add Project" to create your first pipeline.'
      />
      <ProjectUploadModal
        isOpen={!!selectedProjectForUpload}
        onClose={() => setSelectedProjectForUpload(null)}
        project={selectedProjectForUpload}
      />
    </>
  );
};
