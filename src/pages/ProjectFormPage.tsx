import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/store/store';
import { useGetProjectQuery } from '@/queries/projectQueries';
import { ProjectForm } from '@/components/dashboard/projectForm';

export const ProjectFormPage = () => {
  const token = useAppSelector((store) => store.auth.token);
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('projectId');
  const cloneIdParam = searchParams.get('cloneId');

  const targetId = projectIdParam || cloneIdParam;
  const isEditing = !!projectIdParam;
  const isCloning = !!cloneIdParam;

  const { data: projectData, isLoading, isError } = useGetProjectQuery({
    token,
    id: targetId,
  });

  if (targetId && isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex items-center gap-2 text-gray-500 text-sm'>
          <div className='h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent' />
          <span>
            {isCloning
              ? 'Loading project details to clone...'
              : 'Loading project details...'}
          </span>
        </div>
      </div>
    );
  }

  if (targetId && isError) {
    return (
      <div className='max-w-xl mx-auto mt-12 p-6 rounded-lg bg-error-50 border border-error-200 text-error-700 text-sm'>
        Failed to load video project details. The project may not exist or you may not have access.
      </div>
    );
  }

  return (
    <ProjectForm
      isEditing={isEditing}
      isCloning={isCloning}
      initialData={projectData}
    />
  );
};

export default ProjectFormPage;
