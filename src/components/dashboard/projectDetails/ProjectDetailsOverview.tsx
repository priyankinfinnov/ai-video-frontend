import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ClockIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FolderIcon,
  ScissorsIcon,
  PenIcon,
  PlayIcon,
  SparklesIcon,
} from 'lucide-react';
import { VideoProject, ProjectType } from '@/types/project';
import { Button } from '@/components/ui/button';
import { getCreatedDate } from '@/utils/utils';

interface ProjectDetailsOverviewProps {
  project: VideoProject;
  onSwitchToVideoTab: () => void;
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

export const ProjectDetailsOverview = ({
  project,
  onSwitchToVideoTab,
}: ProjectDetailsOverviewProps) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const copyToClipboard = (text: string, type: 'prompt' | 'script') => {
    navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
      toast.success('Prompt copied to clipboard');
    } else {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
      toast.success('Script copied to clipboard');
    }
  };

  const typeConfig = TYPE_CONFIG[project.type] || {
    label: project.type,
    bgClass: 'bg-gray-50 border-gray-200',
    textClass: 'text-gray-700',
  };

  const timings = [
    { label: 'Script Generation', value: project.scriptGenSec },
    { label: 'Parts Splitting', value: project.partsSplittingSec },
    { label: 'TTS Rewriting', value: project.ttsRewriteSec },
    { label: 'Parts Creation', value: project.partsCreationSec },
    { label: 'Total Audio Gen', value: project.totalAudioGenSec },
    { label: 'Total Video Gen', value: project.totalVideoGenSec },
    { label: 'Upscaling (1440p)', value: project.upscaleGenSec },
    { label: 'Subtitles Burning', value: project.subtitlesGenSec },
  ];

  return (
    <div className='space-y-6'>
      {/* Top Banner / Quick Actions */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-primary-50/70 via-purple-50/40 to-white rounded-xl border border-primary-100 shadow-sm'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='font-mono text-sm font-semibold text-primary-800 bg-primary-100 px-2.5 py-0.5 rounded-md'>
              Project #{project.id}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${typeConfig.bgClass} ${typeConfig.textClass}`}
            >
              {typeConfig.label}
            </span>
            <span className='inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700'>
              {project.language}
            </span>
          </div>
          <p className='text-sm text-gray-600 mt-1.5'>
            Created by {project.persona?.name ? <span className='font-medium text-gray-900'>{project.persona.name}</span> : `Persona #${project.personaId}`} on {getCreatedDate(project.createdAt)}
          </p>
        </div>

        <div className='flex items-center gap-2.5 w-full sm:w-auto flex-wrap'>
          <Button
            onClick={onSwitchToVideoTab}
            className='bg-primary-600 hover:bg-primary-700 text-white shadow-sm flex items-center gap-1.5 text-xs'
          >
            <PlayIcon className='w-3.5 h-3.5 fill-current' />
            View 480p Video
          </Button>

          <Button
            asChild
            variant='secondary-gray'
            size='sm'
            className='flex items-center gap-1.5 text-xs'
          >
            <Link to={`/dashboard/shorts-form?videoProjectId=${project.id}`}>
              <ScissorsIcon className='w-3.5 h-3.5 text-primary-600' />
              Create Shorts
            </Link>
          </Button>

          <Button
            asChild
            variant='secondary-gray'
            size='sm'
            className='flex items-center gap-1.5 text-xs'
          >
            <Link to={`/dashboard/project-form?projectId=${project.id}`}>
              <PenIcon className='w-3.5 h-3.5 text-gray-600' />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid of Key Info Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='p-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
            Pipeline Status
          </p>
          <div className='mt-2 flex items-center gap-2'>
            <span className='w-2.5 h-2.5 rounded-full bg-primary-500' />
            <span className='text-base font-semibold text-gray-900 capitalize'>
              {project.status.replace(/_/g, ' ').toLowerCase()}
            </span>
          </div>
        </div>

        <div className='p-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
            Rough Length & Words
          </p>
          <p className='mt-2 text-base font-semibold text-gray-900'>
            {project.roughLengthInMins ? `${project.roughLengthInMins} min` : 'N/A'}{' '}
            <span className='text-xs font-normal text-gray-500'>
              ({project.wordCount ? `${project.wordCount} words` : 'Calculating...'})
            </span>
          </p>
        </div>

        <div className='p-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
            Publication Status
          </p>
          <div className='mt-2 flex items-center gap-2'>
            {project.isPublished ? (
              <div className='flex items-center gap-1.5'>
                <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-700 border border-success-200'>
                  Published
                </span>
                {project.publishedLink && (
                  <a
                    href={
                      project.publishedLink.startsWith('http')
                        ? project.publishedLink
                        : `https://${project.publishedLink}`
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary-600 hover:text-primary-800'
                    title='Visit published URL'
                  >
                    <ExternalLinkIcon className='w-4 h-4' />
                  </a>
                )}
              </div>
            ) : (
              <div className='flex items-center gap-1.5'>
                <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
                  Unpublished (Draft)
                </span>
                {project.publishedLink && (
                  <a
                    href={
                      project.publishedLink.startsWith('http')
                        ? project.publishedLink
                        : `https://${project.publishedLink}`
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary-600 hover:text-primary-800'
                    title='Visit saved link'
                  >
                    <ExternalLinkIcon className='w-4 h-4' />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className='p-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>
            Export Directory
          </p>
          <p
            className='mt-2 text-xs font-mono text-gray-700 truncate'
            title={project.exportDirectory || 'Default storage directory'}
          >
            {project.exportDirectory ? (
              <span className='flex items-center gap-1'>
                <FolderIcon className='w-3.5 h-3.5 text-gray-400 shrink-0' />
                <span className='truncate'>{project.exportDirectory}</span>
              </span>
            ) : (
              <span className='text-gray-400 italic'>Not exported yet</span>
            )}
          </p>
        </div>
      </div>

      {/* Raw Input Prompt Card */}
      <div className='p-5 rounded-xl border border-gray-200 bg-white shadow-sm space-y-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <SparklesIcon className='w-4 h-4 text-primary-600' />
            <h3 className='text-sm font-semibold text-gray-900'>Concept & Raw Input Prompt</h3>
          </div>
          {project.rawInputText && (
            <Button
              variant='tertiary-gray'
              size='sm'
              onClick={() => copyToClipboard(project.rawInputText, 'prompt')}
              className='h-7 text-xs flex items-center gap-1 text-gray-500 hover:text-gray-900'
            >
              {copiedPrompt ? (
                <>
                  <CheckIcon className='w-3.5 h-3.5 text-success-600' />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon className='w-3.5 h-3.5' />
                  <span>Copy Prompt</span>
                </>
              )}
            </Button>
          )}
        </div>
        <div className='p-3.5 rounded-lg bg-gray-50 border border-gray-100 font-mono text-xs text-gray-800 leading-relaxed whitespace-pre-wrap break-words'>
          {project.rawInputText || 'No raw input text provided.'}
        </div>
      </div>

      {/* Generated Script Card */}
      <div className='p-5 rounded-xl border border-gray-200 bg-white shadow-sm space-y-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FileTextIcon className='w-4 h-4 text-primary-600' />
            <h3 className='text-sm font-semibold text-gray-900'>Generated Script</h3>
            {project.wordCount && (
              <span className='text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium'>
                {project.wordCount} words
              </span>
            )}
          </div>
          {project.generatedScript && (
            <Button
              variant='tertiary-gray'
              size='sm'
              onClick={() => copyToClipboard(project.generatedScript || '', 'script')}
              className='h-7 text-xs flex items-center gap-1 text-gray-500 hover:text-gray-900'
            >
              {copiedScript ? (
                <>
                  <CheckIcon className='w-3.5 h-3.5 text-success-600' />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon className='w-3.5 h-3.5' />
                  <span>Copy Script</span>
                </>
              )}
            </Button>
          )}
        </div>
        <div className='p-4 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-800 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap break-words'>
          {project.generatedScript || (
            <span className='text-gray-400 italic'>
              Script not generated yet. The AI pipeline will populate this upon script generation.
            </span>
          )}
        </div>
      </div>

      {/* Generation Timings & Performance Breakdown */}
      <div className='p-5 rounded-xl border border-gray-200 bg-white shadow-sm space-y-3'>
        <div className='flex items-center gap-2'>
          <ClockIcon className='w-4 h-4 text-primary-600' />
          <h3 className='text-sm font-semibold text-gray-900'>
            Pipeline Generation Timings
          </h3>
        </div>
        <p className='text-xs text-gray-500'>
          Detailed benchmarking metrics for each stage in the end-to-end video synthesis pipeline.
        </p>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2'>
          {timings.map((t) => (
            <div
              key={t.label}
              className='p-3 rounded-lg bg-gray-50 border border-gray-100'
            >
              <p className='text-xs text-gray-500 font-medium truncate'>{t.label}</p>
              <p className='text-sm font-semibold text-gray-900 mt-1'>
                {t.value !== null && t.value !== undefined ? (
                  <span className='text-primary-700 font-mono'>{t.value.toFixed(2)}s</span>
                ) : (
                  <span className='text-gray-400 font-normal italic'>Pending</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsOverview;
