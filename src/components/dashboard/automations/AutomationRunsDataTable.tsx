import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Youtube,
  Instagram,
  Film,
  Scissors,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Zap,
  Hand,
} from 'lucide-react';
import { AutomationRun } from '@/types/automation';
import { DataTable } from '@/components/common/DataTable';
import { getCreatedDate } from '@/utils/utils';

interface AutomationRunsDataTableProps {
  data: AutomationRun[];
  isLoading?: boolean;
  hidePersonaColumn?: boolean;
}

const getRunStatusBadge = (status?: string | null) => {
  if (!status) {
    return (
      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
        Unknown
      </span>
    );
  }
  const upper = status.toUpperCase();
  if (upper === 'SUCCESS' || upper === 'PUBLISHED' || upper === 'COMPLETED') {
    return (
      <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'>
        <CheckCircle2 className='w-3.5 h-3.5' /> Success
      </span>
    );
  }
  if (upper === 'FAILED') {
    return (
      <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200'>
        <AlertCircle className='w-3.5 h-3.5' /> Failed
      </span>
    );
  }
  if (upper === 'SKIPPED_NO_ASSETS' || upper.startsWith('SKIPPED')) {
    return (
      <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200' title='Skipped because no unuploaded completed assets were found'>
        <AlertTriangle className='w-3.5 h-3.5' /> Skipped (No Assets)
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
      <Clock className='w-3.5 h-3.5' /> {status}
    </span>
  );
};

export const AutomationRunsDataTable = ({
  data,
  isLoading = false,
  hidePersonaColumn = false,
}: AutomationRunsDataTableProps) => {
  const columns = useMemo<ColumnDef<AutomationRun>[]>(() => {
    const cols: ColumnDef<AutomationRun>[] = [
      {
        accessorKey: 'id',
        header: 'Run ID',
        cell: ({ row }) => {
          const run = row.original;
          return (
            <div className='flex flex-col min-w-[90px]'>
              <span className='font-mono font-semibold text-xs text-gray-900'>
                Run #{run.id}
              </span>
              <span className='inline-flex items-center gap-1 text-[10px] text-gray-500 mt-0.5'>
                {run.isManualTrigger ? (
                  <span className='inline-flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200' title='Manually triggered execution'>
                    <Hand className='w-2.5 h-2.5' /> Manual
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-0.5 text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200' title='Scheduled auto execution'>
                    <Zap className='w-2.5 h-2.5' /> Auto
                  </span>
                )}
              </span>
            </div>
          );
        },
      },
      {
        id: 'automationName',
        header: 'Automation Rule',
        cell: ({ row }) => {
          const run = row.original;
          const ruleName = run.automation?.name || `Rule #${run.automationId}`;
          return (
            <div className='flex flex-col max-w-[180px] truncate'>
              <span className='font-semibold text-xs text-gray-900 truncate' title={ruleName}>
                {ruleName}
              </span>
              <span className='text-[10px] text-gray-400 font-mono'>
                Rule ID: #{run.automationId}
              </span>
            </div>
          );
        },
      },
    ];

    if (!hidePersonaColumn) {
      cols.push({
        accessorKey: 'personaId',
        header: 'Persona',
        cell: ({ row }) => {
          const run = row.original;
          return (
            <span className='inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 font-mono truncate max-w-[130px]' title={run.persona?.name || `Persona #${run.personaId}`}>
              {run.persona?.name || `Persona #${run.personaId}`}
            </span>
          );
        },
      });
    }

    cols.push(
      {
        accessorKey: 'platform',
        header: 'Platform',
        cell: ({ row }) => {
          const platform = String(row.getValue('platform') || '').toUpperCase();
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
      {
        id: 'target',
        header: 'Target Content',
        cell: ({ row }) => {
          const run = row.original;
          const target = String(run.targetType || '').toUpperCase();
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
          const run = row.original;
          const mode = String(run.uploadType || '').toUpperCase();
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getRunStatusBadge(row.getValue('status')),
      },
      {
        id: 'details',
        header: 'Output / Error Log',
        cell: ({ row }) => {
          const run = row.original;
          if (run.postUrl) {
            return (
              <a
                href={run.postUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium'
              >
                View Post <ExternalLink className='w-3 h-3' />
              </a>
            );
          }
          if (run.errorMessage) {
            return (
              <span
                className='text-xs text-red-600 truncate max-w-[200px] block font-mono bg-red-50/50 px-1.5 py-0.5 rounded border border-red-100'
                title={run.errorMessage}
              >
                {run.errorMessage}
              </span>
            );
          }
          if (run.title || run.shortsClip?.title || run.videoProject?.rawInputText) {
            const displayTitle = run.title || run.shortsClip?.title || run.videoProject?.rawInputText || '';
            return (
              <span className='text-xs text-gray-700 truncate max-w-[200px] block' title={displayTitle}>
                {displayTitle}
              </span>
            );
          }
          return <span className='text-xs text-gray-400 italic'>--</span>;
        },
      },
      {
        id: 'executedAt',
        header: 'Executed At',
        cell: ({ row }) => {
          const run = row.original;
          const timestamp = run.startedAt || run.createdAt || run.completedAt;
          if (!timestamp) return <span className='text-xs text-gray-400 italic'>--</span>;
          return (
            <span className='text-xs text-gray-600 font-medium whitespace-nowrap' title={new Date(timestamp).toLocaleString()}>
              {getCreatedDate(timestamp)}
            </span>
          );
        },
      }
    );

    return cols;
  }, [hidePersonaColumn]);

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyMessage='No execution runs found matching the selected filters.'
    />
  );
};

export default AutomationRunsDataTable;
