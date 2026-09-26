import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  FileTextIcon,
  LayersIcon,
  SparklesIcon,
  AwardIcon,
  ScissorsIcon,
  FilmIcon,
  PlayIcon,
  PenIcon,
} from 'lucide-react';
import { useGetProjectQuery } from '@/queries/projectQueries';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import {
  ProjectDetailsOverview,
  VideoPartsTab,
  VideoPartAssetsTab,
  ScriptIterationLogsTab,
  ShortsProjectsTab,
  ShortsClipsTab,
  VideoPlayerTab,
} from '@/components/dashboard/projectDetails';
import { ProjectType } from '@/types/project';

type TabKey =
  | 'details'
  | 'parts'
  | 'assets'
  | 'script-logs'
  | 'shorts-projects'
  | 'shorts-clips'
  | 'video-480p';

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
  const upper = (status || '').toUpperCase();
  if (upper === 'COMPLETED') {
    return (
      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200'>
        Completed
      </span>
    );
  }
  if (upper === 'FAILED') {
    return (
      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-50 text-error-700 border border-error-200'>
        Failed
      </span>
    );
  }
  if (upper === 'PENDING') {
    return (
      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-50 text-warning-700 border border-warning-200'>
        Pending
      </span>
    );
  }
  return (
    <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200'>
      <span className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
      {status.replace(/_/g, ' ').toLowerCase()}
    </span>
  );
};

export const ProjectDetailsPage = () => {
  const params = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = useAppSelector((store) => store.auth.token);

  // Extract ID from route path (/dashboard/projects/:id) or query param (?projectId=...)
  const projectId = params.id || searchParams.get('projectId') || '';

  // Tab state derived from URL
  const initialTab = (searchParams.get('tab') as TabKey) || 'details';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabKey;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const { data: project, isLoading, isError } = useGetProjectQuery({
    id: projectId,
    token,
  });

  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: 'details', label: 'Project Details', icon: FileTextIcon },
    { key: 'parts', label: 'Video Parts', icon: LayersIcon },
    { key: 'assets', label: 'Part Assets', icon: SparklesIcon },
    { key: 'script-logs', label: 'Script Iterations', icon: AwardIcon },
    { key: 'shorts-projects', label: 'Shorts Projects', icon: ScissorsIcon },
    { key: 'shorts-clips', label: 'Short Clips', icon: FilmIcon },
    { key: 'video-480p', label: '480p Video Player', icon: PlayIcon },
  ];

  if (isLoading) {
    return (
      <div className='p-6 space-y-6 max-w-7xl mx-auto'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-24 bg-gray-200 animate-pulse rounded-md' />
          <div className='h-8 w-48 bg-gray-200 animate-pulse rounded-md' />
        </div>
        <div className='h-40 bg-gray-100 animate-pulse rounded-xl' />
        <div className='h-96 bg-gray-50 animate-pulse rounded-xl' />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className='p-6 max-w-3xl mx-auto text-center py-16 space-y-4'>
        <div className='w-12 h-12 rounded-full bg-error-50 text-error-600 flex items-center justify-center mx-auto'>
          <FileTextIcon className='w-6 h-6' />
        </div>
        <h2 className='text-lg font-bold text-gray-900'>Video Project Not Found</h2>
        <p className='text-sm text-gray-500 max-w-md mx-auto'>
          We could not load details for Project #{projectId}. It may have been deleted or you may lack permission to access it.
        </p>
        <Button asChild variant='secondary-gray' size='sm'>
          <Link to='/dashboard/projects' className='flex items-center gap-1.5'>
            <ArrowLeftIcon className='w-4 h-4' />
            Back to Video Projects
          </Link>
        </Button>
      </div>
    );
  }

  const typeConfig = TYPE_CONFIG[project.type] || {
    label: project.type,
    bgClass: 'bg-gray-50 border-gray-200',
    textClass: 'text-gray-700',
  };

  return (
    <div className='p-6 space-y-6 max-w-7xl mx-auto'>
      {/* Top Breadcrumb & Return Action */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2 text-xs text-gray-500'>
          <Link
            to='/dashboard/projects'
            className='hover:text-primary-600 font-medium flex items-center gap-1'
          >
            <ArrowLeftIcon className='w-3.5 h-3.5' />
            Projects
          </Link>
          <span>/</span>
          <span className='font-mono font-semibold text-gray-900'>
            Project #{project.id}
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            asChild
            variant='secondary-gray'
            size='sm'
            className='text-xs flex items-center gap-1.5'
          >
            <Link to={`/dashboard/project-form?projectId=${project.id}`}>
              <PenIcon className='w-3.5 h-3.5' />
              Edit
            </Link>
          </Button>

          <Button
            asChild
            size='sm'
            className='bg-primary-600 hover:bg-primary-700 text-white text-xs flex items-center gap-1.5 shadow-sm'
          >
            <Link to={`/dashboard/shorts-form?videoProjectId=${project.id}`}>
              <ScissorsIcon className='w-3.5 h-3.5' />
              Create Shorts
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Page Title Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200'>
        <div className='space-y-1.5'>
          <div className='flex items-center gap-2.5 flex-wrap'>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-900 tracking-tight'>
              {project.rawInputText ? (
                <span className='line-clamp-1 max-w-2xl' title={project.rawInputText}>
                  {project.rawInputText}
                </span>
              ) : (
                `Video Project #${project.id}`
              )}
            </h1>
            {getStatusBadge(project.status)}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${typeConfig.bgClass} ${typeConfig.textClass}`}
            >
              {typeConfig.label}
            </span>
            <span className='inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700'>
              {project.language}
            </span>
          </div>

          <p className='text-xs text-gray-500'>
            Persona: <span className='font-medium text-gray-800'>{project.persona?.name || `#${project.personaId}`}</span>
            {project.roughLengthInMins ? ` • Target: ${project.roughLengthInMins}m` : ''}
            {project.wordCount ? ` • ${project.wordCount} words` : ''}
          </p>
        </div>
      </div>

      {/* 6+1 Tab Bar Navigation */}
      <div className='border-b border-gray-200 overflow-x-auto'>
        <nav className='flex space-x-1 sm:space-x-2 -mb-px' aria-label='Project Tabs'>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type='button'
                onClick={() => handleTabChange(tab.key)}
                data-testid={`tab-${tab.key}`}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors rounded-t-md ${
                  isActive
                    ? 'border-primary-600 text-primary-600 bg-primary-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className='pt-2'>
        {activeTab === 'details' && (
          <ProjectDetailsOverview
            project={project}
            onSwitchToVideoTab={() => handleTabChange('video-480p')}
          />
        )}

        {activeTab === 'parts' && (
          <VideoPartsTab projectId={project.id} />
        )}

        {activeTab === 'assets' && (
          <VideoPartAssetsTab projectId={project.id} />
        )}

        {activeTab === 'script-logs' && (
          <ScriptIterationLogsTab projectId={project.id} />
        )}

        {activeTab === 'shorts-projects' && (
          <ShortsProjectsTab projectId={project.id} />
        )}

        {activeTab === 'shorts-clips' && (
          <ShortsClipsTab projectId={project.id} />
        )}

        {activeTab === 'video-480p' && (
          <VideoPlayerTab project={project} />
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
