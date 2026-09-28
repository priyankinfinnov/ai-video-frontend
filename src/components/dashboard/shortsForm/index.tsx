import { FormEvent, useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, SparklesIcon, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppSelector } from '@/store/store';
import {
  useGetProjectsQuery,
  useGetShortsProjectQuery,
} from '@/queries/projectQueries';
import {
  useCreateShortsProjectMutation,
  useUpdateShortsProjectMutation,
} from '@/queries/projectActions';
import {
  SHORTS_PROJECT_STATUS_OPTIONS,
  ShortsProjectStatus,
} from '@/types/project';

export const ShortsForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useAppSelector((store) => store.auth.token);

  const editShortsIdParam =
    searchParams.get('shortsProjectId') || searchParams.get('editId');
  const isEditing = !!editShortsIdParam;
  const preselectedProjectId = searchParams.get('videoProjectId');

  const { data: existingShorts } =
    useGetShortsProjectQuery({
      token,
      id: editShortsIdParam || undefined,
    });

  const { data: projectsResponse, isLoading: isLoadingProjects } =
    useGetProjectsQuery({
      token,
      page: 1,
      limit: 100,
    });
  const projects = useMemo(
    () => projectsResponse?.data || [],
    [projectsResponse?.data]
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    preselectedProjectId || ''
  );
  const [status, setStatus] = useState<ShortsProjectStatus>('PENDING');

  const { mutate: createShortsProject, isLoading: isCreating } =
    useCreateShortsProjectMutation(token);
  const { mutate: updateShortsProject, isLoading: isUpdating } =
    useUpdateShortsProjectMutation(editShortsIdParam || undefined, token);

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (existingShorts) {
      setSelectedProjectId(String(existingShorts.videoProjectId));
      setStatus((existingShorts.status as ShortsProjectStatus) || 'PENDING');
    } else if (preselectedProjectId) {
      setSelectedProjectId(preselectedProjectId);
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(String(projects[0].id));
    }
  }, [existingShorts, preselectedProjectId, projects, selectedProjectId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (isEditing && editShortsIdParam) {
      updateShortsProject(
        {
          id: editShortsIdParam,
          payload: { status },
        },
        {
          onSuccess: () => {
            navigate('/dashboard/projects?tab=shorts');
          },
        }
      );
      return;
    }

    const videoProjectId = parseInt(selectedProjectId, 10);
    if (!videoProjectId || isNaN(videoProjectId)) {
      toast.error('Please select a valid Video Project to generate shorts from');
      return;
    }

    createShortsProject(
      { videoProjectId },
      {
        onSuccess: () => {
          navigate('/dashboard/projects?tab=shorts');
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-8 max-w-2xl mx-auto px-4 md:px-8 py-8 w-full'
    >
      {/* Back button and Title */}
      <div className='flex items-center gap-4'>
        <Button
          type='button'
          variant='tertiary-gray'
          size='sm'
          onClick={() => navigate('/dashboard/projects?tab=shorts')}
          className='flex items-center gap-1.5 text-gray-500 hover:text-gray-900'
        >
          <ArrowLeftIcon className='w-4 h-4' />
          <span>Back to Shorts</span>
        </Button>
      </div>

      <div className='border-b border-gray-200 pb-5'>
        <div className='flex items-center gap-2'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            {isEditing ? `Edit Shorts Project #${editShortsIdParam}` : 'Generate Shorts Project'}
          </h1>
          <SparklesIcon className='w-5 h-5 text-primary-600' />
        </div>
        <p className='text-sm text-gray-500 mt-1'>
          {isEditing
            ? 'Update pipeline status or diagnostic details for this shorts project.'
            : 'Convert full-length video projects into virality-scored short clips using LLM audio & visual extraction.'}
        </p>
      </div>

      {/* Main Section */}
      <div className='flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
        <h2 className='text-base font-semibold text-gray-900'>
          {isEditing ? 'Pipeline Configuration' : 'Source Video Selection'}
        </h2>

        {/* Video Project Select */}
        <div className='flex flex-col gap-2'>
          <Label htmlFor='video-project' className='font-medium text-gray-700'>
            Source Video Project <span className='text-error-500'>*</span>
          </Label>

          {isLoadingProjects ? (
            <div className='text-sm text-gray-500 py-2'>Loading projects...</div>
          ) : projects.length > 0 ? (
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={isEditing}
            >
              <SelectTrigger id='video-project' data-testid='select-source-project-trigger'>
                <SelectValue placeholder='Choose a video project...' />
              </SelectTrigger>
              <SelectContent>
                {projects.map((proj) => (
                  <SelectItem key={proj.id} value={String(proj.id)}>
                    Project #{proj.id} —{' '}
                    {proj.rawInputText
                      ? proj.rawInputText.slice(0, 50) + (proj.rawInputText.length > 50 ? '...' : '')
                      : 'Untitled'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className='p-4 rounded-lg bg-warning-50 border border-warning-200 text-warning-800 text-sm'>
              No video projects found. You must create at least one video project first before generating shorts.
            </div>
          )}
          <span className='text-xs text-gray-400'>
            {isEditing
              ? 'The parent video project from which these highlights were extracted.'
              : 'The shorts pipeline will transcribe and extract highlight moments from this project.'}
          </span>
        </div>

        {/* Pipeline Status (Visible when editing) */}
        {isEditing && (
          <div className='border-t border-gray-100 pt-5 flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div>
                <Label htmlFor='shorts-status' className='font-medium text-gray-800 text-sm'>
                  Pipeline Status <span className='text-error-500'>*</span>
                </Label>
                <p className='text-xs text-gray-500 mt-0.5'>
                  Modify the pipeline status to restart generation, retry a failed step, or mark as completed.
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
              <SelectTrigger id='shorts-status' className='w-full' data-testid='select-shorts-status-trigger'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent className='max-h-72'>
                {SHORTS_PROJECT_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className='flex flex-col text-left py-0.5'>
                      <span className='font-medium text-gray-900 text-xs'>
                        {opt.label} ({opt.value})
                      </span>
                      <span className='text-[11px] text-gray-500'>{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className='flex items-start gap-1.5 p-2.5 rounded-lg bg-purple-50/70 border border-purple-100 text-purple-900 text-xs mt-1.5'>
              <RefreshCw className='w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0' />
              <p>
                Set status to <strong>PENDING</strong> if you need to rerun audio transcription, viral hook search, or clip rendering from scratch.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='flex items-center justify-end gap-3'>
        <Button
          type='button'
          variant='secondary-gray'
          onClick={() => navigate('/dashboard/projects?tab=shorts')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          variant='default'
          disabled={isSubmitting || (!isEditing && projects.length === 0)}
          className='min-w-[140px]'
          data-testid='submit-shorts-button'
        >
          {isSubmitting ? (
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              <span>{isEditing ? 'Updating...' : 'Generating...'}</span>
            </div>
          ) : isEditing ? (
            'Update Shorts Project'
          ) : (
            'Generate Shorts'
          )}
        </Button>
      </div>
    </form>
  );
};
