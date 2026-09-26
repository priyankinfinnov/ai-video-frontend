import { FormEvent, useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, SparklesIcon } from 'lucide-react';

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
import { useGetProjectsQuery } from '@/queries/projectQueries';
import { useCreateShortsProjectMutation } from '@/queries/projectActions';

export const ShortsForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useAppSelector((store) => store.auth.token);

  const preselectedProjectId = searchParams.get('videoProjectId');

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

  const { mutate: createShortsProject, isLoading: isCreating } =
    useCreateShortsProjectMutation(token);

  useEffect(() => {
    if (preselectedProjectId) {
      setSelectedProjectId(preselectedProjectId);
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(String(projects[0].id));
    }
  }, [preselectedProjectId, projects, selectedProjectId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

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
            Generate Shorts Project
          </h1>
          <SparklesIcon className='w-5 h-5 text-primary-600' />
        </div>
        <p className='text-sm text-gray-500 mt-1'>
          Convert full-length video projects into virality-scored short clips using LLM audio & visual extraction.
        </p>
      </div>

      {/* Main Section */}
      <div className='flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
        <h2 className='text-base font-semibold text-gray-900'>Source Video Selection</h2>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='video-project' className='font-medium text-gray-700'>
            Select Video Project <span className='text-error-500'>*</span>
          </Label>

          {isLoadingProjects ? (
            <div className='text-sm text-gray-500 py-2'>Loading projects...</div>
          ) : projects.length > 0 ? (
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
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
            The shorts pipeline will transcribe and extract highlight moments from this project.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex items-center justify-end gap-3'>
        <Button
          type='button'
          variant='secondary-gray'
          onClick={() => navigate('/dashboard/projects?tab=shorts')}
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          variant='default'
          disabled={isCreating || projects.length === 0}
          className='min-w-[140px]'
          data-testid='submit-shorts-button'
        >

          {isCreating ? (
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              <span>Generating...</span>
            </div>
          ) : (
            'Generate Shorts'
          )}
        </Button>
      </div>
    </form>
  );
};
