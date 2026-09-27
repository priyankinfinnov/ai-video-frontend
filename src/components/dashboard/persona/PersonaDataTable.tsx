import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { CopyIcon, EyeIcon, PenIcon, Trash2Icon } from 'lucide-react';
import { Persona } from '@/types/persona';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import { getCreatedDate } from '@/utils/utils';

interface PersonaDataTableProps {
  data: Persona[];
  isLoading?: boolean;
  onDelete?: (id: number) => void;
}

export const PersonaDataTable = ({
  data,
  isLoading = false,
  onDelete,
}: PersonaDataTableProps) => {
  const navigate = useNavigate();

  const columns = useMemo<ColumnDef<Persona>[]>(
    () => [
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const persona = row.original;
          return (
            <div
              className='flex items-center gap-1.5'
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                asChild
                variant='tertiary-gray'
                size='sm'
                className='h-8 w-8 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg'
                title='View Persona Details'
              >
                <Link
                  to={`/dashboard/personas/${persona.id}`}
                  data-testid={`view-persona-${persona.id}`}
                >
                  <EyeIcon className='h-4 w-4' />
                </Link>
              </Button>

              <Button
                asChild
                variant='tertiary-gray'
                size='sm'
                className='h-8 w-8 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg'
                title='Edit Persona'
              >
                <Link
                  to={`/dashboard/persona-form?personaId=${persona.id}`}
                  data-testid={`edit-persona-${persona.id}`}
                >
                  <PenIcon className='h-4 w-4' />
                </Link>
              </Button>

              <Button
                asChild
                variant='tertiary-gray'
                size='sm'
                className='h-8 w-8 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg'
                title='Clone Persona'
              >
                <Link
                  to={`/dashboard/persona-form?cloneId=${persona.id}`}
                  data-testid={`clone-persona-${persona.id}`}
                >
                  <CopyIcon className='h-4 w-4' />
                </Link>
              </Button>

              {onDelete && (
                <Button
                  variant='tertiary-gray'
                  size='sm'
                  onClick={() => onDelete(persona.id)}
                  className='h-8 w-8 p-0 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-lg'
                  title='Delete Persona'
                  data-testid={`delete-persona-${persona.id}`}
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
        accessorKey: 'name',
        header: 'Persona Name',
        cell: ({ row }) => (
          <div className='font-semibold text-gray-900'>
            {row.getValue('name')}
          </div>
        ),
      },
      {
        accessorKey: 'topics',
        header: 'Topics',
        cell: ({ row }) => {
          const topics = (row.getValue('topics') as string[]) || [];
          if (!topics.length) {
            return <span className='text-xs text-gray-400'>None</span>;
          }
          return (
            <div className='flex flex-wrap gap-1.5 max-w-xs'>
              {topics.map((topic, idx) => (
                <Badge
                  key={idx}
                  variant='default'
                  className='text-xs py-0 px-2 font-normal'
                >
                  {topic}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: 'assets',
        header: 'Configured Assets & DNA',
        cell: ({ row }) => {
          const p = row.original;
          const assets = [
            { label: 'Character Sheet', value: p.characterSheetPath },
            { label: 'Head Picture', value: p.headPicturePath },
            { label: 'Ref Audio', value: p.referenceAudioPath },
            { label: 'Writing DNA', value: p.writingDnaPath },
            { label: 'Visual DNA', value: p.visualDnaPath },
            { label: 'Script Prompt', value: p.scriptPromptPath },
            { label: 'Video Prompt', value: p.videoPromptPath },
            { label: 'Script Judge', value: p.scriptJudgePath },
          ].filter((a) => !!a.value);

          if (!assets.length) {
            return (
              <span className='text-xs text-gray-400'>No assets linked</span>
            );
          }

          return (
            <div className='flex flex-wrap gap-1'>
              {assets.map((asset, idx) => (
                <span
                  key={idx}
                  className='inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700'
                  title={`${asset.label}: ${asset.value}`}
                >
                  {asset.label}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
          const dateStr = row.getValue('createdAt') as string;
          return (
            <span className='text-xs text-gray-500 whitespace-nowrap'>
              {getCreatedDate(dateStr)}
            </span>
          );
        },
      },
    ],
    [onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      onRowClick={(persona) => navigate(`/dashboard/personas/${persona.id}`)}
      emptyMessage='No personas found. Click "Add Persona" to create one.'
    />
  );
};

export default PersonaDataTable;
