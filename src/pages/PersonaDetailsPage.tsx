import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  UserIcon,
  FileTextIcon,
  SparklesIcon,
  ImageIcon,
  AwardIcon,
  PenIcon,
  CopyIcon,
  FilmIcon,
} from 'lucide-react';
import { useGetPersonaQuery } from '@/queries/personaQueries';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import {
  PersonaDetailsOverview,
  PersonaScriptFilesTab,
  PersonaVisualFilesTab,
  PersonaCharacterSheetTab,
  PersonaScriptJudgeTab,
  PersonaTabKey,
} from '@/components/dashboard/personaDetails';

export const PersonaDetailsPage = () => {
  const params = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = useAppSelector((store) => store.auth.token);

  // Extract ID from route path (/dashboard/personas/:id) or query param (?personaId=...)
  const personaId = params.id || searchParams.get('personaId') || '';

  // Tab state derived from URL
  const initialTab = (searchParams.get('tab') as PersonaTabKey) || 'details';
  const [activeTab, setActiveTab] = useState<PersonaTabKey>(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as PersonaTabKey;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tab: PersonaTabKey) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const {
    data: persona,
    isLoading,
    isError,
  } = useGetPersonaQuery({
    id: personaId,
    token,
  });

  const tabs: {
    key: PersonaTabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: 'details', label: 'Persona Details', icon: UserIcon },
    { key: 'script-files', label: 'Script Files', icon: FileTextIcon },
    { key: 'visual-files', label: 'Visual Files', icon: SparklesIcon },
    { key: 'character-sheet', label: 'Character Sheet', icon: ImageIcon },
    { key: 'script-judge', label: 'Script Judge', icon: AwardIcon },
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

  if (isError || !persona) {
    return (
      <div className='p-6 max-w-3xl mx-auto text-center py-16 space-y-4'>
        <div className='w-12 h-12 rounded-full bg-error-50 text-error-600 flex items-center justify-center mx-auto'>
          <UserIcon className='w-6 h-6' />
        </div>
        <h2 className='text-lg font-bold text-gray-900'>Persona Not Found</h2>
        <p className='text-sm text-gray-500 max-w-md mx-auto'>
          We could not load details for Persona #{personaId}. It may have been deleted or you may lack permission to access it.
        </p>
        <Button asChild variant='secondary-gray' size='sm'>
          <Link to='/dashboard/personas' className='flex items-center gap-1.5'>
            <ArrowLeftIcon className='w-4 h-4' />
            Back to Personas
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6 max-w-7xl mx-auto'>
      {/* Top Breadcrumb & Return Action */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2 text-xs text-gray-500'>
          <Link
            to='/dashboard/personas'
            className='hover:text-primary-600 font-medium flex items-center gap-1'
          >
            <ArrowLeftIcon className='w-3.5 h-3.5' />
            Personas
          </Link>
          <span>/</span>
          <span className='font-mono font-semibold text-gray-900'>
            {persona.name} (#{persona.id})
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            asChild
            variant='secondary-gray'
            size='sm'
            className='text-xs flex items-center gap-1.5'
          >
            <Link to={`/dashboard/persona-form?personaId=${persona.id}`}>
              <PenIcon className='w-3.5 h-3.5' />
              Edit
            </Link>
          </Button>

          <Button
            asChild
            variant='secondary-gray'
            size='sm'
            className='text-xs flex items-center gap-1.5'
          >
            <Link to={`/dashboard/persona-form?cloneId=${persona.id}`}>
              <CopyIcon className='w-3.5 h-3.5' />
              Clone
            </Link>
          </Button>

          <Button
            asChild
            size='sm'
            className='bg-primary-600 hover:bg-primary-700 text-white text-xs flex items-center gap-1.5 shadow-sm'
          >
            <Link to={`/dashboard/project-form?personaId=${persona.id}`}>
              <FilmIcon className='w-3.5 h-3.5' />
              Create Video Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Page Title Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200'>
        <div className='space-y-1.5'>
          <div className='flex items-center gap-2.5 flex-wrap'>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-900 tracking-tight'>
              {persona.name}
            </h1>
            <span className='font-mono text-xs font-semibold text-primary-800 bg-primary-100 px-2.5 py-0.5 rounded-md'>
              Persona #{persona.id}
            </span>
            <span className='text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md'>
              Team #{persona.teamId}
            </span>
          </div>

          <p className='text-xs text-gray-500'>
            {persona.topics.length} Topics configured • Writing DNA, Character Sheet & Visual Guidelines
          </p>
        </div>
      </div>

      {/* 5 Tab Bar Navigation */}
      <div className='border-b border-gray-200 overflow-x-auto'>
        <nav className='flex space-x-1 sm:space-x-2 -mb-px' aria-label='Persona Tabs'>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type='button'
                onClick={() => handleTabChange(tab.key)}
                data-testid={`tab-${tab.key}`}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors rounded-t-md ${
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
          <PersonaDetailsOverview
            persona={persona}
            onSwitchTab={handleTabChange}
          />
        )}

        {activeTab === 'script-files' && (
          <PersonaScriptFilesTab persona={persona} />
        )}

        {activeTab === 'visual-files' && (
          <PersonaVisualFilesTab persona={persona} />
        )}

        {activeTab === 'character-sheet' && (
          <PersonaCharacterSheetTab persona={persona} />
        )}

        {activeTab === 'script-judge' && (
          <PersonaScriptJudgeTab persona={persona} />
        )}
      </div>
    </div>
  );
};

export default PersonaDetailsPage;
