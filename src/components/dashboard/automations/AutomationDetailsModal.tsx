import { useState } from 'react';
import {
  X,
  Youtube,
  Instagram,
  Film,
  Scissors,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Automation } from '@/types/automation';
import { useTriggerAutomationMutation } from '@/queries/automationActions';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import { getCreatedDate } from '@/utils/utils';

interface AutomationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  automation: Automation | null;
  onEdit?: (automation: Automation) => void;
}

export const AutomationDetailsModal = ({
  isOpen,
  onClose,
  automation,
  onEdit,
}: AutomationDetailsModalProps) => {
  const token = useAppSelector((store) => store.auth.token);
  const { mutateAsync: triggerAutomation, isLoading: isTriggering } =
    useTriggerAutomationMutation(token);
  const [triggerResult, setTriggerResult] = useState<{
    success: boolean;
    message?: string;
    url?: string;
  } | null>(null);

  if (!isOpen || !automation) return null;

  const handleRunNow = async () => {
    try {
      const res = await triggerAutomation(automation.id);
      if (res?.result) {
        setTriggerResult(res.result);
      }
    } catch {
      // toast is handled in mutation
    }
  };

  const getStatusBadge = (status?: string | null) => {
    if (!status) {
      return (
        <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
          Not run yet
        </span>
      );
    }
    const upper = status.toUpperCase();
    if (upper === 'PUBLISHED' || upper === 'COMPLETED' || upper === 'SUCCESS') {
      return (
        <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200'>
          <CheckCircle2 className='w-3 h-3' /> Published
        </span>
      );
    }
    if (upper === 'DRAFT') {
      return (
        <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200'>
          <CheckCircle2 className='w-3 h-3' /> Draft Created
        </span>
      );
    }
    if (upper === 'FAILED') {
      return (
        <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200'>
          <AlertCircle className='w-3 h-3' /> Failed
        </span>
      );
    }
    return (
      <span className='px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200'>
        {status}
      </span>
    );
  };

  return (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50'>
          <div className='flex items-center gap-3'>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                automation.platform === 'YOUTUBE'
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-pink-50 text-pink-600 border border-pink-100'
              }`}
            >
              {automation.platform === 'YOUTUBE' ? (
                <Youtube className='w-5 h-5' />
              ) : (
                <Instagram className='w-5 h-5' />
              )}
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h2 className='text-base font-semibold text-gray-900'>
                  {automation.name || `Automation #${automation.id}`}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    automation.isEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {automation.isEnabled ? 'Active' : 'Paused'}
                </span>
              </div>
              <p className='text-xs text-gray-500'>
                {automation.name ? `ID: #${automation.id} • ` : ''}{automation.platform} • {automation.target === 'PROJECT' ? 'Long-form Video' : 'Shorts Clip'}
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs'>
          {/* Trigger Result Banner */}
          {triggerResult && (
            <div className='p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 space-y-1.5'>
              <div className='font-semibold flex items-center gap-1.5'>
                <CheckCircle2 className='w-4 h-4 text-emerald-600' />
                Run Executed Successfully
              </div>
              <p className='text-[11px] text-emerald-700'>{triggerResult.message}</p>
              {triggerResult.url && (
                <a
                  href={triggerResult.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 font-semibold text-emerald-900 hover:underline pt-0.5'
                >
                  <span>View Published Content</span>
                  <ExternalLink className='w-3 h-3' />
                </a>
              )}
            </div>
          )}

          {/* Details Grid */}
          <div className='grid grid-cols-2 gap-4'>
            {automation.name && (
              <div className='p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1 col-span-2'>
                <span className='text-[11px] text-gray-500 font-medium'>Automation Name</span>
                <div className='font-semibold text-gray-900 text-sm'>
                  {automation.name}
                </div>
              </div>
            )}

            <div className='p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1'>
              <span className='text-[11px] text-gray-500 font-medium'>Persona</span>
              <div className='font-semibold text-gray-900 flex items-center gap-1.5'>
                {automation.persona?.name || `Persona #${automation.personaId}`}
              </div>
            </div>

            <div className='p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1'>
              <span className='text-[11px] text-gray-500 font-medium'>Target Content</span>
              <div className='font-semibold text-gray-900 flex items-center gap-1.5'>
                {automation.target === 'PROJECT' ? (
                  <>
                    <Film className='w-3.5 h-3.5 text-primary-600' />
                    Master Video (1440p)
                  </>
                ) : (
                  <>
                    <Scissors className='w-3.5 h-3.5 text-primary-600' />
                    Shorts Clip (9:16)
                  </>
                )}
              </div>
            </div>

            <div className='p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1'>
              <span className='text-[11px] text-gray-500 font-medium'>Upload Mode</span>
              <div className='font-semibold text-gray-900 flex items-center gap-1.5'>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                    automation.uploadType === 'DRAFT'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {automation.uploadType === 'DRAFT'
                    ? 'Private Studio Draft'
                    : 'Direct Public Post'}
                </span>
              </div>
            </div>

            <div className='p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1'>
              <span className='text-[11px] text-gray-500 font-medium'>Posting Cadence & Max Posts</span>
              <div className='font-semibold text-gray-900'>
                {(() => {
                  const f = (automation.frequency || '').toUpperCase();
                  let name = automation.frequency;
                  if (f === 'MULTIPLE_TIMES_DAILY') name = 'Multiple Times Daily';
                  else if (f === 'MULTIPLE_TIMES_WEEKLY') name = 'Multiple Times Weekly';
                  else if (f === 'EVERY_X_HOURS') name = 'Every X Hours';
                  else if (f === 'IMMEDIATE') name = 'Immediate Post';
                  else if (f === 'DAILY') name = 'Daily Window';
                  else if (f === 'WEEKLY') name = 'Weekly Release';
                  else if (f === 'HOURLY') name = 'Hourly Check';
                  
                  const count = automation.postsPerPeriod ?? 1;
                  return `${name} (${count} max post${count > 1 ? 's' : ''}/period)`;
                })()}
              </div>
            </div>

            <div className='p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1'>
              <span className='text-[11px] text-gray-500 font-medium'>Randomized Time Window</span>
              <div className='font-semibold text-gray-900 flex items-center gap-1'>
                <Clock className='w-3.5 h-3.5 text-primary-500' />
                {automation.timeRangeStart} - {automation.timeRangeEnd}
              </div>
            </div>

            <div className='p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 space-y-1'>
              <span className='text-[11px] text-gray-500 font-medium'>Cooldown Period</span>
              <div className='font-semibold text-gray-900'>
                {automation.cooldownHours} {automation.cooldownHours === 1 ? 'hour' : 'hours'}
              </div>
            </div>
          </div>

          {/* Schedule & Run Telemetry */}
          <div className='p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-3'>
            <div className='font-semibold text-gray-900 flex items-center gap-2'>
              <Calendar className='w-4 h-4 text-primary-600' />
              Schedule & Execution Telemetry
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs'>
              <div>
                <span className='text-[11px] text-gray-500 block'>Next Scheduled Post:</span>
                <span className='font-mono font-medium text-gray-800'>
                  {automation.scheduledPostAt
                    ? new Date(automation.scheduledPostAt).toLocaleString()
                    : 'Awaiting next schedule cycle'}
                </span>
              </div>

              <div>
                <span className='text-[11px] text-gray-500 block'>Last Execution:</span>
                <span className='font-mono font-medium text-gray-800'>
                  {automation.lastRunAt
                    ? `${new Date(automation.lastRunAt).toLocaleString()} (${getCreatedDate(
                        automation.lastRunAt
                      )})`
                    : 'Never run'}
                </span>
              </div>

              <div>
                <span className='text-[11px] text-gray-500 block'>Last Run Result:</span>
                <div className='mt-1'>{getStatusBadge(automation.lastRunStatus)}</div>
              </div>

              <div>
                <span className='text-[11px] text-gray-500 block'>Created:</span>
                <span className='font-medium text-gray-600'>
                  {automation.createdAt
                    ? new Date(automation.createdAt).toLocaleDateString()
                    : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50'>
          <Button
            type='button'
            size='sm'
            disabled={isTriggering}
            onClick={handleRunNow}
            className='bg-amber-600 hover:bg-amber-700 text-white text-xs flex items-center gap-1.5 shadow-xs'
          >
            {isTriggering ? (
              <>
                <Loader2 className='w-3.5 h-3.5 animate-spin' />
                Running...
              </>
            ) : (
              <>
                <Play className='w-3.5 h-3.5 fill-current' />
                Run Now (Manual Upload)
              </>
            )}
          </Button>

          <div className='flex items-center gap-2'>
            {onEdit && (
              <Button
                type='button'
                variant='secondary-gray'
                size='sm'
                onClick={() => {
                  onClose();
                  onEdit(automation);
                }}
                className='text-xs'
              >
                Edit Automation
              </Button>
            )}

            <Button
              type='button'
              variant='secondary-gray'
              size='sm'
              onClick={onClose}
              className='text-xs'
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationDetailsModal;
