import { FormEvent, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppSelector } from '@/store/store';
import { useGetPersonasQuery } from '@/queries/personaQueries';
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from '@/queries/projectActions';
import {
  VideoProject,
  ProjectType,
  ProjectLanguage,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '@/types/project';

interface ProjectFormProps {
  isEditing?: boolean;
  isCloning?: boolean;
  initialData?: VideoProject;
}

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: 'FULL_AI_GENERATED_VIDEO', label: 'Full AI Generated Video' },
  { value: 'AUDIOBOOK', label: 'Audiobook' },
  { value: 'TALKING_HEAD_VIDEO', label: 'Talking Head Video' },
  { value: 'REMOTION_VIDEO', label: 'Remotion Video' },
];

const PROJECT_LANGUAGES: { value: ProjectLanguage; label: string }[] = [
  { value: 'ENGLISH', label: 'English' },
  { value: 'GERMAN', label: 'German' },
  { value: 'SPANISH', label: 'Spanish' },
];

export const ProjectForm = ({
  isEditing = false,
  isCloning = false,
  initialData,
}: ProjectFormProps) => {
  const navigate = useNavigate();
  const token = useAppSelector((store) => store.auth.token);

  // Fetch personas for dropdown
  const { data: personasResponse } = useGetPersonasQuery({
    token,
    page: 1,
    limit: 50,
  });
  const personas = useMemo(
    () => personasResponse?.data || [],
    [personasResponse?.data]
  );


  const [personaId, setPersonaId] = useState<string>('');
  const [rawInputText, setRawInputText] = useState('');
  const [roughLengthInMins, setRoughLengthInMins] = useState<number>(3.5);
  const [type, setType] = useState<ProjectType>('FULL_AI_GENERATED_VIDEO');
  const [language, setLanguage] = useState<ProjectLanguage>('ENGLISH');
  const [isPublished, setIsPublished] = useState(false);
  const [publishedLink, setPublishedLink] = useState('');

  const { mutate: createProject, isLoading: isCreating } =
    useCreateProjectMutation(token);
  const { mutate: updateProject, isLoading: isUpdating } =
    useUpdateProjectMutation(initialData?.id, token);

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (initialData) {
      setPersonaId(String(initialData.personaId));
      setRawInputText(
        initialData.rawInputText
          ? isCloning
            ? `${initialData.rawInputText} (Copy)`
            : initialData.rawInputText
          : ''
      );
      setRoughLengthInMins(initialData.roughLengthInMins || 3.5);
      setType(initialData.type || 'FULL_AI_GENERATED_VIDEO');
      setLanguage(initialData.language || 'ENGLISH');
      setIsPublished(Boolean(initialData.isPublished));
      setPublishedLink(initialData.publishedLink || '');
    } else if (personas.length > 0 && !personaId) {
      setPersonaId(String(personas[0].id));
    }
  }, [initialData, isCloning, personas, personaId]);


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const activePersonaId =
      parseInt(personaId, 10) ||
      (personas.length > 0 ? personas[0].id : 0) ||
      (initialData ? initialData.personaId : 0);

    if (!activePersonaId) {
      toast.error('Please select or specify a valid Creator Persona');
      return;
    }

    if (!rawInputText.trim() && !isEditing) {
      toast.error('Please provide a prompt or concept for the video project');
      return;
    }

    if (isEditing && initialData?.id) {
      const updatePayload: UpdateProjectRequest = {
        isPublished: Boolean(isPublished),
        ...(publishedLink.trim() ? { publishedLink: publishedLink.trim() } : {}),
        ...(rawInputText.trim() ? { rawInputText: rawInputText.trim() } : {}),
        ...(roughLengthInMins ? { roughLengthInMins } : {}),
      };

      updateProject(updatePayload, {
        onSuccess: () => {
          navigate('/dashboard/projects');
        },
      });
    } else {
      const createPayload: CreateProjectRequest = {
        personaId: activePersonaId,
        rawInputText: rawInputText.trim(),
        roughLengthInMins: Number(roughLengthInMins) || 3.5,
        type,
        language,
        isPublished: Boolean(isPublished),
        ...(publishedLink.trim() ? { publishedLink: publishedLink.trim() } : {}),
      };

      createProject(createPayload, {
        onSuccess: () => {
          navigate('/dashboard/projects');
        },
      });
    }

  };


  return (
    <form
      onSubmit={handleSubmit}
      className='flex flex-col gap-8 max-w-4xl mx-auto px-4 md:px-8 py-8 w-full'
    >
      {/* Back button and Title */}
      <div className='flex items-center gap-4'>
        <Button
          type='button'
          variant='tertiary-gray'
          size='sm'
          onClick={() => navigate('/dashboard/projects')}
          className='flex items-center gap-1.5 text-gray-500 hover:text-gray-900'
        >
          <ArrowLeftIcon className='w-4 h-4' />
          <span>Back to Projects</span>
        </Button>
      </div>

      <div className='border-b border-gray-200 pb-5'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          {isEditing
            ? 'Edit Video Project'
            : isCloning
            ? 'Clone Video Project'
            : 'Create New Video Project'}
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          Configure the AI video pipeline parameters, prompt, persona, and generation style.
        </p>
      </div>

      {/* Main Section */}
      <div className='flex flex-col gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
        <h2 className='text-base font-semibold text-gray-900'>Pipeline Configuration</h2>

        {/* Persona Select */}
        <div className='flex flex-col gap-2'>
          <Label htmlFor='project-persona' className='font-medium text-gray-700'>
            Creator Persona <span className='text-error-500'>*</span>
          </Label>
          {personas.length > 0 ? (
            <Select value={personaId} onValueChange={setPersonaId}>
              <SelectTrigger id='project-persona' className='w-full' data-testid='select-persona-trigger'>
                <SelectValue placeholder='Select a persona' />
              </SelectTrigger>
              <SelectContent>
                {personas.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} (#{p.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id='project-persona'
              type='number'
              value={personaId}
              onChange={(e) => setPersonaId(e.target.value)}
              placeholder='Enter Persona ID (e.g. 1)'
              required
            />
          )}
          <span className='text-xs text-gray-400'>
            The persona dictates voice cloning, tone of script, and visuals.
          </span>
        </div>

        {/* Prompt / Raw Input Text */}
        <div className='flex flex-col gap-2'>
          <Label htmlFor='project-prompt' className='font-medium text-gray-700'>
            Video Prompt / Concept <span className='text-error-500'>*</span>
          </Label>
          <Textarea
            id='project-prompt'
            value={rawInputText}
            onChange={(e) => setRawInputText(e.target.value)}
            placeholder='e.g., Explain how quantum computing will revolutionize digital security by 2030...'
            required={!isEditing}
            className='min-h-[100px]'
            data-testid='project-prompt-input'
          />
          <span className='text-xs text-gray-400'>
            Raw topic description or script seeds to guide LLM script synthesis.
          </span>
        </div>

        {/* Grid for Length, Type, and Language */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Rough Length */}
          <div className='flex flex-col gap-2'>
            <Label htmlFor='project-length' className='font-medium text-gray-700'>
              Target Duration (mins)
            </Label>
            <Input
              id='project-length'
              type='number'
              step='0.5'
              min='0.5'
              max='60'
              value={roughLengthInMins}
              onChange={(e) => setRoughLengthInMins(parseFloat(e.target.value) || 0)}
              data-testid='project-length-input'
            />
            <span className='text-xs text-gray-400'>Estimated runtime in minutes</span>
          </div>

          {/* Project Type */}
          <div className='flex flex-col gap-2'>
            <Label htmlFor='project-type' className='font-medium text-gray-700'>
              Video Format / Type
            </Label>
            <Select value={type} onValueChange={(val) => setType(val as ProjectType)}>
              <SelectTrigger id='project-type' data-testid='select-type-trigger'>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className='text-xs text-gray-400'>Pipeline rendering mode</span>
          </div>

          {/* Language */}
          <div className='flex flex-col gap-2'>
            <Label htmlFor='project-language' className='font-medium text-gray-700'>
              Spoken Language
            </Label>
            <Select
              value={language}
              onValueChange={(val) => setLanguage(val as ProjectLanguage)}
            >
              <SelectTrigger id='project-language' data-testid='select-language-trigger'>
                <SelectValue placeholder='Select language' />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className='text-xs text-gray-400'>TTS synthesis language</span>
          </div>
        </div>

        {/* Publishing Options */}
        <div className='border-t border-gray-100 pt-5 flex flex-col gap-4'>
          <h3 className='text-sm font-semibold text-gray-800'>Publishing Status</h3>
          <div className='flex items-center gap-3'>
            <Checkbox
              id='project-is-published'
              checked={isPublished}
              onCheckedChange={(checked) => setIsPublished(Boolean(checked))}
              data-testid='project-published-checkbox'
            />
            <Label
              htmlFor='project-is-published'
              className='text-sm font-normal text-gray-700 cursor-pointer'
            >
              Mark video as Published
            </Label>
          </div>

          {isPublished && (
            <div className='flex flex-col gap-2 pl-7'>
              <Label htmlFor='project-published-link' className='text-xs font-medium text-gray-700'>
                Published URL / Link
              </Label>
              <Input
                id='project-published-link'
                type='url'
                value={publishedLink}
                onChange={(e) => setPublishedLink(e.target.value)}
                placeholder='https://youtube.com/watch?v=...'
                className='h-9 text-sm'
                data-testid='project-published-link-input'
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex items-center justify-end gap-3'>
        <Button
          type='button'
          variant='secondary-gray'
          onClick={() => navigate('/dashboard/projects')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          variant='default'
          disabled={isSubmitting}
          className='min-w-[140px]'
          data-testid='submit-project-button'
        >

          {isSubmitting ? (
            <div className='flex items-center gap-2'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              <span>Saving...</span>
            </div>
          ) : isEditing ? (
            'Update Project'
          ) : (
            'Create Project'
          )}
        </Button>
      </div>
    </form>
  );
};
