import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/store/store';
import { useGetPersonaQuery } from '@/queries/personaQueries';
import PersonaForm from '@/components/dashboard/personaForm';

export const PersonaFormPage = () => {
  const token = useAppSelector((store) => store.auth.token);
  const [searchParams] = useSearchParams();
  const personaIdParam = searchParams.get('personaId');
  const cloneIdParam = searchParams.get('cloneId');

  const targetId = personaIdParam || cloneIdParam;
  const isEditing = !!personaIdParam;
  const isCloning = !!cloneIdParam;

  const { data: personaData, isLoading, isError } = useGetPersonaQuery({
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
              ? 'Loading persona details to clone...'
              : 'Loading persona details...'}
          </span>
        </div>
      </div>
    );
  }

  if (targetId && isError) {
    return (
      <div className='max-w-xl mx-auto mt-12 p-6 rounded-lg bg-error-50 border border-error-200 text-error-700 text-sm'>
        Failed to load persona details. The persona may not exist or you may not have access.
      </div>
    );
  }

  return (
    <PersonaForm
      isEditing={isEditing}
      isCloning={isCloning}
      initialData={personaData}
    />
  );
};

export default PersonaFormPage;
