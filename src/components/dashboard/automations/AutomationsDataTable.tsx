import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Youtube,
  Instagram,
  Film,
  Scissors,
  Play,
  Pen,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { Automation } from '@/types/automation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/common/DataTable';
import {
  useUpdateAutomationMutation,
  useTriggerAutomationMutation,
} from '@/queries/automationActions';
import { useAppSelector } from '@/store/store';
import { getCreatedDate } from '@/utils/utils';

interface AutomationsDataTableProps {
  data: Automation[];
  isLoading?: boolean;
  onEdit?: (automation: Automation) => void;
  onDelete?: (id: number) => void;
  onViewDetails?: (automation: Automation) => void;
  hidePersonaColumn?: boolean; // When rendered inside persona automations tab
}

const getStatusBadge = (status?: string | null) => {
  if (!status) {
    return (
      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
        Not run yet
      </span>
    );
  }
  const upper = status.toUpperCase();
  if (upper === 'PUBLISHED' || upper === 'COMPLETED' || upper === 'SUCCESS') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'>
        <CheckCircle2 className='w-3 h-3' /> Published
      </span>
    );
  }
  if (upper === 'DRAFT') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
        <CheckCircle2 className='w-3 h-3' /> Draft
      </span>
    );
  }
  if (upper === 'FAILED') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200'>
        <AlertCircle className='w-3 h-3' /> Failed
      </span>
    );
  }
  return (
    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200'>
      {status}
    </span>
  );
};

export const AutomationsDataTable = ({
  data,
  isLoading = false,
  onEdit,
  onDelete,
  onViewDetails,
  hidePersonaColumn = false,
}: AutomationsDataTableProps) => {
  const token = useAppSelector((store) => store.auth.token);
  const [runningId, setRunningId] = useState<number | null>(null);

  const { mutateAsync: updateAutomation } = useUpdateAutomationMutation(undefined, token);
  const { mutateAsync: triggerAutomation } = useTriggerAutomationMutation(token);

  const handleToggleActive = async (automation: Automation) => {
    try {
      await updateAutomation({
        id: automation.id,
        isEnabled: !automation.isEnabled,
      });
    } catch {
      // toast is handled in mutation
    }
  };

  const handleRunNow = async (id: number) => {
    try {
      setRunningId(id);
      await triggerAutomation(id);
    } finally {
      setRunningId(null);
    }
  };

  const columns = useMemo<ColumnDef<Automation>[]>(() => {
    const cols: ColumnDef<Automation>[] = [
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const auto = row.original;
          const isRunning = runningId === auto.id;

          return (
            <div
              className='flex items-center gap-1'
              onClick={(e) => e.stopPropagation()}
            >
              {/* Trigger Run Now */}
              <Button
                variant='tertiary-gray'
                size='sm'
                disabled={isRunning}
                onClick={() => handleRunNow(auto.id)}
                className='h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg'
                title='Run Now (One-click upload)'
                data-testid={`trigger-automation-${auto.id}`}
              >
                {isRunning ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Play className='h-3.5 w-3.5 fill-current' />
                )}
              </Button>

              {/* View Details */}
              {onViewDetails && (
                <Button
                  variant='tertiary-gray'
                  size='sm'
                  onClick={() => onViewDetails(auto)}
                  className='h-8 w-8 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg'
                  title='View Details & Telemetry'
                  data-testid={`view-automation-${auto.id}`}
                >
                  <Eye className='h-4 w-4' />
                </Button>
              )}

              {/* Edit */}
              {onEdit && (
                <Button
                  variant='tertiary-gray'
                  size='sm'
                  onClick={() => onEdit(auto)}
                  className='h-8 w-8 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg'
                  title='Edit Automation'
                  data-testid={`edit-automation-${auto.id}`}
                >
                  <Pen className='h-3.5 w-3.5' />
                </Button>
              )}

              {/* Delete */}
              {onDelete && (
                <Button
                  variant='tertiary-gray'
                  size='sm'
                  onClick={() => onDelete(auto.id)}
                  className='h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg'
                  title='Delete Automation'
                  data-testid={`delete-automation-${auto.id}`}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'platform',
        header: 'Platform',
        cell: ({ row }) => {
          const platform = row.getValue('platform') as string;
          if (platform === 'YOUTUBE') {
            return (
              <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200'>
                <Youtube className='w-3.5 h-3.5 text-red-600' />
                YouTube
              </span>
            );
          }
          return (
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200'>
              <Instagram className='w-3.5 h-3.5 text-pink-600' />
              Instagram
            </span>
          );
        },
      },
    ];

    if (!hidePersonaColumn) {
      cols.push({
        accessorKey: 'personaId',
        header: 'Persona',
        cell: ({ row }) => {
          const auto = row.original;
          return (
            <span className='inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 font-mono'>
              {auto.persona?.name || `Persona #${auto.personaId}`}
            </span>
          );
        },
      });
    }

    cols.push(
      {
        id: 'target',
        header: 'Target Content',
        cell: ({ row }) => {
          const auto = row.original;
          const target = String(auto.target || auto.targetType || '');
          if (target === 'PROJECT' || target === 'LONG_FORM_VIDEO') {
            return (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200'>
                <Film className='w-3 h-3' /> Master Video
              </span>
            );
          }
          return (
            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200'>
              <Scissors className='w-3 h-3' /> Shorts Clip
            </span>
          );
        },
      },
      {
        accessorKey: 'uploadType',
        header: 'Mode',
        cell: ({ row }) => {
          const auto = row.original;
          const mode = (auto.uploadType || '') as string;
          if (mode === 'DRAFT') {
            return (
              <span className='inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
                Draft
              </span>
            );
          }
          return (
            <span className='inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'>
              Publish
            </span>
          );
        },
      },
      {
        id: 'timeWindow',
        header: 'Time Window & Cadence',
        cell: ({ row }) => {
          const auto = row.original;
          return (
            <div className='flex items-center gap-1 text-xs text-gray-700 font-medium'>
              <Clock className='w-3 h-3 text-gray-400 shrink-0' />
              <span>
                {auto.timeRangeStart} - {auto.timeRangeEnd}
              </span>
              <span className='text-[10px] text-gray-500 uppercase ml-1 bg-gray-100 px-1.5 py-0.5 rounded'>
                {auto.frequency}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'cooldownHours',
        header: 'Cooldown',
        cell: ({ row }) => (
          <span className='text-xs font-mono text-gray-600 font-medium'>
            {row.getValue('cooldownHours')}h
          </span>
        ),
      },
      {
        accessorKey: 'lastRunStatus',
        header: 'Last Run Status',
        cell: ({ row }) => {
          const auto = row.original;
          return (
            <div className='space-y-0.5'>
              <div>{getStatusBadge(auto.lastRunStatus)}</div>
              {auto.lastRunAt && (
                <div className='text-[10px] text-gray-400'>
                  {getCreatedDate(auto.lastRunAt)}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'scheduledPostAt',
        header: 'Next Post',
        cell: ({ row }) => {
          const val = row.getValue('scheduledPostAt') as string | null;
          if (!val) {
            return <span className='text-xs text-gray-400 italic'>--</span>;
          }
          return (
            <span
              className='text-xs text-gray-600 font-medium'
              title={new Date(val).toLocaleString()}
            >
              {new Date(val).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          );
        },
      },
      {
        accessorKey: 'isEnabled',
        header: 'Active',
        cell: ({ row }) => {
          const auto = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={auto.isEnabled}
                  onChange={() => handleToggleActive(auto)}
                  className='sr-only peer'
                  data-testid={`toggle-automation-${auto.id}`}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          );
        },
      }
    );

    return cols;
  }, [runningId, hidePersonaColumn, onEdit, onDelete, onViewDetails, updateAutomation, triggerAutomation]);

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      onRowClick={(auto) => onViewDetails?.(auto)}
      emptyMessage='No publishing automations configured yet. Create an automation to start automatic scheduled uploads.'
    />
  );
};

export default AutomationsDataTable;
