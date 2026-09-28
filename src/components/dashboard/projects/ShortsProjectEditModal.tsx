import React, { useState, useEffect } from 'react';
import { X, ScissorsIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ShortsProject,
  ShortsProjectStatus,
  SHORTS_PROJECT_STATUS_OPTIONS,
} from '@/types/project';
import { useUpdateShortsProjectMutation } from '@/queries/projectActions';
import { useAppSelector } from '@/store/store';

interface ShortsProjectEditModalProps {
  shortsProject: ShortsProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShortsProjectEditModal: React.FC<ShortsProjectEditModalProps> = ({
  shortsProject,
  isOpen,
  onClose,
}) => {
  const token = useAppSelector((store) => store.auth.token);
  const [status, setStatus] = useState<ShortsProjectStatus>('PENDING');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { mutate: updateShortsProject, isLoading: isUpdating } =
    useUpdateShortsProjectMutation(shortsProject?.id, token);

  useEffect(() => {
    if (shortsProject) {
      setStatus((shortsProject.status as ShortsProjectStatus) || 'PENDING');
      setErrorMessage(shortsProject.errorMessage || '');
    }
  }, [shortsProject]);

  if (!isOpen || !shortsProject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateShortsProject(
      {
        id: shortsProject.id,
        payload: {
          status,
          errorMessage: errorMessage.trim() || null,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div
      className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200'
      onClick={onClose}
    >
      <div
        className='relative bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-200'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70'>
          <div className='flex items-center gap-2'>
            <div className='p-2 rounded-lg bg-primary-50 text-primary-600'>
              <ScissorsIcon className='w-4 h-4' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-gray-900'>
                Edit Shorts Project #{shortsProject.id}
              </h2>
              <p className='text-xs text-gray-500'>
                Source Project #{shortsProject.videoProjectId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors'
            title='Close'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className='p-6 space-y-5'>
          {/* Status Selection */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='shorts-status' className='text-xs font-semibold text-gray-700'>
                Pipeline Status <span className='text-error-500'>*</span>
              </Label>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  status === 'COMPLETED'
                    ? 'bg-success-50 text-success-700 border border-success-200'
                    : status === 'FAILED'
                    ? 'bg-error-50 text-error-700 border border-error-200'
                    : status === 'PENDING'
                    ? 'bg-warning-50 text-warning-700 border border-warning-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {status}
              </span>
            </div>

            <Select
              value={status}
              onValueChange={(val) => setStatus(val as ShortsProjectStatus)}
            >
              <SelectTrigger id='shorts-status' className='w-full' data-testid='shorts-status-select-trigger'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent className='max-h-72'>
                {SHORTS_PROJECT_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className='flex flex-col text-left py-0.5'>
                      <span className='font-medium text-gray-900 text-xs'>
                        {opt.label} ({opt.value})
                      </span>
                      <span className='text-[11px] text-gray-500'>
                        {opt.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='flex items-start gap-1.5 p-2.5 rounded-lg bg-purple-50/70 border border-purple-100 text-purple-900 text-xs mt-1.5'>
              <RefreshCw className='w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0' />
              <p>
                Set status to <strong>PENDING</strong> if you need to rerun audio transcription, hook discovery, or clip carving from scratch.
              </p>
            </div>
          </div>

          {/* Optional Error Message / Notes */}
          <div className='space-y-1.5'>
            <Label htmlFor='shorts-error-msg' className='text-xs font-semibold text-gray-700 flex items-center gap-1.5'>
              <AlertCircle className='w-3.5 h-3.5 text-gray-500' />
              <span>Error Message / Diagnostic Notes</span>
            </Label>
            <Textarea
              id='shorts-error-msg'
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder='Optional notes or error message...'
              className='min-h-[80px] text-xs font-mono'
              data-testid='shorts-error-msg-input'
            />
            <span className='text-[11px] text-gray-400'>
              Clear this field when resetting status to restart with a clean slate.
            </span>
          </div>

          {/* Modal Actions */}
          <div className='flex items-center justify-end gap-3 pt-3 border-t border-gray-100'>
            <Button
              type='button'
              variant='secondary-gray'
              size='sm'
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='default'
              size='sm'
              disabled={isUpdating}
              className='min-w-[120px]'
              data-testid='save-shorts-status-btn'
            >
              {isUpdating ? (
                <div className='flex items-center gap-2'>
                  <div className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShortsProjectEditModal;
