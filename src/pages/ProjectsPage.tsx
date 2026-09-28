import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusIcon, ScissorsIcon, FilmIcon } from 'lucide-react';


import { ProjectDataTable, ShortsDataTable } from '@/components/dashboard/projects';
import { DataTableFilterBar, DataTablePagination } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  useGetProjectsQuery,
  useGetShortsProjectsQuery,
} from '@/queries/projectQueries';
import {
  useDeleteProjectMutation,
  useDeleteShortsProjectMutation,
} from '@/queries/projectActions';
import { useAppSelector } from '@/store/store';
import useDataTableFilters from '@/hooks/useDataTableFilters';

interface ProjectsPageProps {
  defaultTab?: 'projects' | 'shorts';
}

export const ProjectsPage = ({ defaultTab }: ProjectsPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = useAppSelector((store) => store.auth.token);

  // Tab state derived from URL or prop
  const currentTab = (searchParams.get('tab') as 'projects' | 'shorts') || defaultTab || 'projects';
  const [activeTab, setActiveTab] = useState<'projects' | 'shorts'>(currentTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'shorts' || tabFromUrl === 'projects') {
      setActiveTab(tabFromUrl);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [searchParams, defaultTab]);

  const handleTabChange = (tab: 'projects' | 'shorts') => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set('tab', tab);
      return updated;
    });
  };

  // Filter & Pagination hook
  const {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
  } = useDataTableFilters({ initialPage: 1, initialLimit: 50 });

  // Projects queries
  const {
    data: projectsResponse,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useGetProjectsQuery({
    token,
    page,
    limit,
  });

  // Shorts queries
  const {
    data: shortsResponse,
    isLoading: isShortsLoading,
    isError: isShortsError,
  } = useGetShortsProjectsQuery({
    token,
    page,
    limit,
  });

  const { mutate: deleteProject } = useDeleteProjectMutation();
  const { mutate: deleteShortsProject } = useDeleteShortsProjectMutation();

  const projectsList = useMemo(
    () => projectsResponse?.data || [],
    [projectsResponse?.data]
  );
  const projectsPagination = projectsResponse?.pagination;

  const rawShortsList = useMemo(
    () => shortsResponse?.data || [],
    [shortsResponse?.data]
  );
  const shortsPagination = shortsResponse?.pagination;

  // Enrich shorts items with parent project info if available
  const shortsList = useMemo(() => {
    const projectMap = new Map(projectsList.map((p) => [p.id, p]));
    return rawShortsList.map((s) => ({
      ...s,
      videoProject: s.videoProject || projectMap.get(s.videoProjectId),
    }));
  }, [rawShortsList, projectsList]);


  // Filter Video Projects
  const filteredProjects = useMemo(() => {
    if (!debouncedSearch.trim()) return projectsList;
    const lower = debouncedSearch.toLowerCase();
    return projectsList.filter(
      (p) =>
        p.rawInputText?.toLowerCase().includes(lower) ||
        String(p.id).includes(lower) ||
        p.type?.toLowerCase().includes(lower) ||
        p.language?.toLowerCase().includes(lower) ||
        p.status?.toLowerCase().includes(lower)
    );
  }, [projectsList, debouncedSearch]);

  // Filter Shorts Projects
  const filteredShorts = useMemo(() => {
    if (!debouncedSearch.trim()) return shortsList;
    const lower = debouncedSearch.toLowerCase();
    return shortsList.filter(
      (s) =>
        String(s.id).includes(lower) ||
        String(s.videoProjectId).includes(lower) ||
        s.status?.toLowerCase().includes(lower) ||
        s.videoProject?.rawInputText?.toLowerCase().includes(lower)
    );
  }, [shortsList, debouncedSearch]);

  const handleDeleteProject = (id: number) => {
    if (window.confirm('Are you sure you want to delete this video project?')) {
      deleteProject(id);
    }
  };

  const handleDeleteShorts = (id: number) => {
    if (window.confirm('Are you sure you want to delete this shorts project?')) {
      deleteShortsProject(id);
    }
  };

  return (
    <main className='flex flex-col gap-6 px-4 md:px-8 py-8 w-full'>
      {/* Header with Title and Tabs on Right Side */}
      <header className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl md:text-3xl font-semibold text-gray-900'>
              {activeTab === 'projects' ? 'Video Projects' : 'Short Projects'}
            </h1>
          </div>
          <p className='text-sm text-gray-500 mt-1'>
            {activeTab === 'projects'
              ? 'Manage long-form AI video generation pipelines, prompts, and rendering.'
              : 'Manage short-form viral highlights, clips, and multi-platform conversions.'}
          </p>
        </div>

        {/* Right-Hand Controls: Tab Switcher & Action Button */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
          {/* Tab Switcher Pills */}
          <div
            className='inline-flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200'
            role='tablist'
            aria-label='Project Views'
            data-testid='project-view-tabs'
          >
            <button
              role='tab'
              aria-selected={activeTab === 'projects'}
              onClick={() => handleTabChange('projects')}
              className={`flex items-center gap-2 py-1.5 px-3.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'projects'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              data-testid='tab-video-projects'
            >
              <FilmIcon className='w-4 h-4' />
              <span>Video Projects</span>
            </button>

            <button
              role='tab'
              aria-selected={activeTab === 'shorts'}
              onClick={() => handleTabChange('shorts')}
              className={`flex items-center gap-2 py-1.5 px-3.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'shorts'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              data-testid='tab-short-projects'
            >
              <ScissorsIcon className='w-4 h-4' />
              <span>Short Projects</span>
            </button>
          </div>

          {/* Action Button */}
          {activeTab === 'projects' ? (
            <Button asChild size='md' className='text-white shrink-0'>
              <Link
                to='/dashboard/project-form'
                className='flex items-center gap-2 py-2 px-4 text-sm font-medium'
                data-testid='add-project-button'
              >
                <PlusIcon className='w-4 h-4' />
                <span>Add Project</span>
              </Link>
            </Button>
          ) : (
            <Button asChild size='md' className='text-white shrink-0'>
              <Link
                to='/dashboard/shorts-form'
                className='flex items-center gap-2 py-2 px-4 text-sm font-medium'
                data-testid='add-shorts-button'
              >
                <PlusIcon className='w-4 h-4' />
                <span>Generate Shorts</span>
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* Filter and Search Bar */}
      <DataTableFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          activeTab === 'projects'
            ? 'Search projects by prompt, ID, type, or status...'
            : 'Search shorts by ID, source project, or status...'
        }
      />

      {/* Error States */}
      {activeTab === 'projects' && isProjectsError && (
        <div className='p-4 rounded-lg bg-error-50 border border-error-200 text-error-700 text-sm'>
          Unable to load video projects. Please ensure the backend server is running and try again.
        </div>
      )}

      {activeTab === 'shorts' && isShortsError && (
        <div className='p-4 rounded-lg bg-error-50 border border-error-200 text-error-700 text-sm'>
          Unable to load shorts projects. Please ensure the backend server is running and try again.
        </div>
      )}

      {/* Tables based on active tab */}
      {activeTab === 'projects' ? (
        <ProjectDataTable
          data={filteredProjects}
          isLoading={isProjectsLoading}
          onDelete={handleDeleteProject}
        />
      ) : (
        <ShortsDataTable
          data={filteredShorts}
          isLoading={isShortsLoading}
          onDelete={handleDeleteShorts}
        />
      )}

      {/* Pagination */}
      {activeTab === 'projects' && projectsPagination && (
        <DataTablePagination
          pagination={projectsPagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}

      {activeTab === 'shorts' && shortsPagination && (
        <DataTablePagination
          pagination={shortsPagination}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      )}
    </main>
  );
};

export default ProjectsPage;
