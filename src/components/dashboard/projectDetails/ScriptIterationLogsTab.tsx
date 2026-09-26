import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { FileTextIcon, AwardIcon, CheckCircle2Icon, XCircleIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { ScriptIterationLog } from '@/types/project';
import { DataTable, DataTableFilterBar, DataTablePagination } from '@/components/common';
import { useGetScriptIterationLogsQuery } from '@/queries/projectQueries';
import { useAppSelector } from '@/store/store';
import useDataTableFilters from '@/hooks/useDataTableFilters';
import { getCreatedDate } from '@/utils/utils';
import { Button } from '@/components/ui/button';

interface ScriptIterationLogsTabProps {
  projectId: number;
}

const getVerdictBadge = (verdict?: string | null) => {
  const v = (verdict || '').toUpperCase();
  if (v === 'APPROVED' || v === 'PASS' || v === 'PASSED') {
    return (
      <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200'>
        <CheckCircle2Icon className='w-3.5 h-3.5 text-success-600' />
        Approved
      </span>
    );
  }
  if (v === 'REJECTED' || v === 'FAIL' || v === 'FAILED') {
    return (
      <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-50 text-error-700 border border-error-200'>
        <XCircleIcon className='w-3.5 h-3.5 text-error-600' />
        Rejected
      </span>
    );
  }
  return (
    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200'>
      {verdict || 'Reviewing'}
    </span>
  );
};

export const ScriptIterationLogsTab = ({ projectId }: ScriptIterationLogsTabProps) => {
  const token = useAppSelector((store) => store.auth.token);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
  } = useDataTableFilters({ initialPage: 1, initialLimit: 10 });

  const { data: response, isLoading } = useGetScriptIterationLogsQuery({
    token,
    videoProjectId: projectId,
    page,
    limit,
  });

  const logsList = useMemo(() => response?.data || [], [response?.data]);
  const pagination = response?.pagination;

  // Filter client-side by feedback or verdict if searched
  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return logsList;
    const lower = debouncedSearch.toLowerCase();
    return logsList.filter(
      (l) =>
        l.judgeFeedback?.toLowerCase().includes(lower) ||
        l.verdict?.toLowerCase().includes(lower) ||
        l.scriptText?.toLowerCase().includes(lower) ||
        String(l.attemptNumber).includes(lower)
    );
  }, [logsList, debouncedSearch]);

  const columns = useMemo<ColumnDef<ScriptIterationLog>[]>(
    () => [
      {
        accessorKey: 'attemptNumber',
        header: 'Attempt #',
        cell: ({ row }) => (
          <span className='inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200'>
            Attempt #{row.getValue('attemptNumber')}
          </span>
        ),
      },
      {
        accessorKey: 'verdict',
        header: 'Judge Verdict',
        cell: ({ row }) => getVerdictBadge(row.getValue('verdict')),
      },
      {
        accessorKey: 'score',
        header: 'Score',
        cell: ({ row }) => {
          const score = row.getValue('score') as number | null;
          if (score === null || score === undefined) {
            return <span className='text-xs text-gray-400 italic'>--</span>;
          }
          const isHigh = score >= 75;
          const isMid = score >= 50 && score < 75;
          return (
            <div className='flex items-center gap-1.5'>
              <span
                className={`text-xs font-mono font-bold ${
                  isHigh ? 'text-success-700' : isMid ? 'text-amber-600' : 'text-error-600'
                }`}
              >
                {score}/100
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'judgeFeedback',
        header: 'Judge Feedback & Critique',
        cell: ({ row }) => {
          const feedback = (row.getValue('judgeFeedback') as string) || '';
          return (
            <div className='max-w-md text-xs text-gray-800 leading-relaxed font-normal' title={feedback}>
              {feedback || <span className='text-gray-400 italic'>No critique provided</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'judgeGenSec',
        header: 'Judge Sec',
        cell: ({ row }) => {
          const sec = row.getValue('judgeGenSec') as number | null;
          return sec ? (
            <span className='text-xs font-mono text-gray-600 font-medium'>
              {sec.toFixed(2)}s
            </span>
          ) : (
            <span className='text-xs text-gray-400 italic'>--</span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => (
          <span className='text-xs text-gray-500 whitespace-nowrap'>
            {getCreatedDate(row.getValue('createdAt'))}
          </span>
        ),
      },
      {
        id: 'expandScript',
        header: 'Script',
        cell: ({ row }) => {
          const log = row.original;
          const isExpanded = expandedLogId === log.id;
          return (
            <Button
              variant='tertiary-gray'
              size='sm'
              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
              className='h-7 text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1'
            >
              <span>{isExpanded ? 'Hide' : 'Read'}</span>
              {isExpanded ? <ChevronUpIcon className='w-3 h-3' /> : <ChevronDownIcon className='w-3 h-3' />}
            </Button>
          );
        },
      },
    ],
    [expandedLogId]
  );

  const expandedLog = useMemo(
    () => logsList.find((l) => l.id === expandedLogId),
    [logsList, expandedLogId]
  );

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
        <div>
          <h3 className='text-sm font-semibold text-gray-900 flex items-center gap-2'>
            <AwardIcon className='w-4 h-4 text-primary-600' />
            Script Judge & Iteration Logs
          </h3>
          <p className='text-xs text-gray-500 mt-0.5'>
            Iterative evaluation feedback and scoring from the persona's AI script judge.
          </p>
        </div>

        <DataTableFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder='Filter by feedback or verdict...'
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        emptyMessage='No script iteration logs recorded for this project.'
      />

      {/* Expanded Script Drawer / Card */}
      {expandedLog && (
        <div className='p-4 rounded-xl border border-primary-200 bg-purple-50/40 space-y-2 animate-in fade-in duration-200'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <FileTextIcon className='w-4 h-4 text-primary-700' />
              <h4 className='text-xs font-bold text-primary-900 uppercase tracking-wide'>
                Attempt #{expandedLog.attemptNumber} Draft Script Text
              </h4>
            </div>
            <Button
              variant='tertiary-gray'
              size='sm'
              onClick={() => setExpandedLogId(null)}
              className='h-6 text-xs text-gray-500'
            >
              Close
            </Button>
          </div>
          <div className='p-3.5 rounded-lg bg-white border border-purple-100 text-xs text-gray-800 leading-relaxed font-mono whitespace-pre-wrap max-h-72 overflow-y-auto'>
            {expandedLog.scriptText}
          </div>
        </div>
      )}

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

export default ScriptIterationLogsTab;
