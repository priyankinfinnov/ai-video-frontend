import { FormEvent, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  SparklesIcon,
  FileTextIcon,
  LinkIcon,
  ExternalLinkIcon,
  PlusIcon,
} from 'lucide-react';

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
  VIDEO_PROJECT_STATUS_OPTIONS,
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
  const [inputMode, setInputMode] = useState<'prompt' | 'script'>('prompt');
  const [showBothInputs, setShowBothInputs] = useState(false);
  const [rawInputText, setRawInputText] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [roughLengthInMins, setRoughLengthInMins] = useState<number>(3.5);
  const [type, setType] = useState<ProjectType>('FULL_AI_GENERATED_VIDEO');
  const [language, setLanguage] = useState<ProjectLanguage>('ENGLISH');
  const [isPublished, setIsPublished] = useState(false);
  const [publishedLink, setPublishedLink] = useState('');
  const [status, setStatus] = useState<string>('PENDING');

  const { mutate: createProject, isLoading: isCreating } =
    useCreateProjectMutation(token);
  const { mutate: updateProject, isLoading: isUpdating } =
    useUpdateProjectMutation(initialData?.id, token);

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (initialData) {
      setPersonaId(String(initialData.personaId));
      setStatus(initialData.status || 'PENDING');
      setRawInputText(
        initialData.rawInputText
          ? isCloning
            ? `${initialData.rawInputText} (Copy)`
            : initialData.rawInputText
          : ''
      );
      setGeneratedScript(initialData.generatedScript || '');
      if (initialData.generatedScript && !initialData.rawInputText) {
        setInputMode('script');
      } else if (initialData.generatedScript && initialData.rawInputText) {
        setShowBothInputs(true);
      }
      setRoughLengthInMins(initialData.roughLengthInMins || 3.5);
      setType(initialData.type || 'FULL_AI_GENERATED_VIDEO');
      setLanguage(initialData.language || 'ENGLISH');
      setIsPublished(Boolean(initialData.isPublished));
      setPublishedLink(initialData.publishedLink || '');
    } else if (personas.length > 0 && !personaId) {
      setPersonaId(String(personas[0].id));
    }
  }, [initialData, isCloning, personas, personaId]);

  const scriptWords = useMemo(() => {
    return generatedScript.trim()
      ? generatedScript.trim().split(/\s+/).filter(Boolean).length
      : 0;
  }, [generatedScript]);

  const scriptEstMinutes = useMemo(() => {
    return (scriptWords / 150).toFixed(1);
  }, [scriptWords]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const activePersonaId =
      parseInt(personaId, 10) ||
      (personas.length > 0 ? personas[0].id : 1) ||
      (initialData ? initialData.personaId : 1);

    if (!activePersonaId) {
      toast.error('Please select or specify a valid Creator Persona');
      return;
    }

    const trimmedRaw = rawInputText.trim();
    const trimmedScript = generatedScript.trim();

    if (!trimmedRaw && !trimmedScript && !isEditing) {
      toast.error(
        'Please provide either a video prompt/concept or a generated script'
      );
      return;
    }

    // Fallback: if only script is provided, synthesize a short concept seed from its first line
    const effectiveRaw =
      trimmedRaw ||
      (trimmedScript ? trimmedScript.split('\n')[0].slice(0, 140) : '');

    if (isEditing && initialData?.id) {
      const updatePayload: UpdateProjectRequest = {
        isPublished: Boolean(isPublished),
        publishedLink: publishedLink.trim() || null,
        ...(effectiveRaw ? { rawInputText: effectiveRaw } : {}),
        generatedScript: trimmedScript || null,
        ...(roughLengthInMins ? { roughLengthInMins } : {}),
        type,
        language,
        status,
      };

      updateProject(updatePayload, {
        onSuccess: () => {
          navigate('/dashboard/projects');
        },
      });
    } else {
      const createPayload: CreateProjectRequest = {
        personaId: activePersonaId,
        rawInputText: effectiveRaw,
        ...(trimmedScript ? { generatedScript: trimmedScript } : {}),
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
          Configure the AI video pipeline parameters, prompt or custom script, persona, and publishing status.
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
              <SelectTrigger
                id='project-persona'
                className='w-full'
                data-testid='select-persona-trigger'
              >
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
              value={personaId || '1'}
              onChange={(e) => setPersonaId(e.target.value)}
              placeholder='Enter Persona ID (e.g. 1)'
              required
            />
          )}
          <span className='text-xs text-gray-400'>
            The persona dictates voice cloning, tone of script, and visuals.
          </span>
        </div>

        {/* Script & Content Input Section */}
        <div className='flex flex-col gap-3'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
            <Label className='font-medium text-gray-700'>
              Script Source & Video Content <span className='text-error-500'>*</span>
            </Label>
            <button
              type='button'
              onClick={() => setShowBothInputs((prev) => !prev)}
              className='text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 self-start sm:self-auto'
              data-testid='toggle-both-inputs-button'
            >
              {showBothInputs ? (
                'Show single input mode'
              ) : (
                <>
                  <PlusIcon className='w-3 h-3' />
                  <span>Provide both prompt & custom script</span>
                </>
              )}
            </button>
          </div>

          {!showBothInputs && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1 bg-gray-50 border border-gray-200 rounded-lg'>
              <button
                type='button'
                onClick={() => setInputMode('prompt')}
                data-testid='input-mode-prompt-btn'
                className={`flex items-start gap-2.5 p-3 rounded-md text-left transition-all ${
                  inputMode === 'prompt'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <div
                  className={`p-1.5 rounded-md ${
                    inputMode === 'prompt'
                      ? 'bg-primary-50 text-primary-600'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <SparklesIcon className='w-4 h-4' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-1'>
                    <span className='text-xs font-semibold'>Generate from Prompt</span>
                    {rawInputText.trim() && (
                      <span className='inline-flex items-center text-[10px] font-medium text-success-600 bg-success-50 px-1.5 py-0.5 rounded'>
                        Filled
                      </span>
                    )}
                  </div>
                  <p className='text-[11px] text-gray-400 mt-0.5 line-clamp-1'>
                    AI synthesizes script from your topic or prompt
                  </p>
                </div>
              </button>

              <button
                type='button'
                onClick={() => setInputMode('script')}
                data-testid='input-mode-script-btn'
                className={`flex items-start gap-2.5 p-3 rounded-md text-left transition-all ${
                  inputMode === 'script'
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/60'
                }`}
              >
                <div
                  className={`p-1.5 rounded-md ${
                    inputMode === 'script'
                      ? 'bg-primary-50 text-primary-600'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <FileTextIcon className='w-4 h-4' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-1'>
                    <span className='text-xs font-semibold'>Provide Custom Script</span>
                    {generatedScript.trim() && (
                      <span className='inline-flex items-center text-[10px] font-medium text-success-600 bg-success-50 px-1.5 py-0.5 rounded'>
                        Filled
                      </span>
                    )}
                  </div>
                  <p className='text-[11px] text-gray-400 mt-0.5 line-clamp-1'>
                    Paste complete pre-written script directly
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Prompt / Raw Input Textarea (visible if prompt mode OR showBothInputs) */}
          {(showBothInputs || inputMode === 'prompt') && (
            <div className='flex flex-col gap-1.5 mt-1'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='project-prompt'
                  className='text-xs font-medium text-gray-700 flex items-center gap-1.5'
                >
                  <SparklesIcon className='w-3.5 h-3.5 text-primary-600' />
                  <span>Video Prompt / Concept</span>
                  {!generatedScript.trim() && !isEditing && (
                    <span className='text-error-500'>*</span>
                  )}
                </Label>
                {rawInputText && (
                  <span className='text-[11px] text-gray-400'>
                    {rawInputText.length} chars
                  </span>
                )}
              </div>
              <Textarea
                id='project-prompt'
                value={rawInputText}
                onChange={(e) => setRawInputText(e.target.value)}
                placeholder='e.g., Explain how quantum computing will revolutionize digital security by 2030...'
                className='min-h-[100px] text-sm'
                data-testid='project-prompt-input'
              />
              <span className='text-[11px] text-gray-400'>
                Raw topic description, hooks, or seeds to guide LLM script synthesis.
              </span>
            </div>
          )}

          {/* Generated Script Textarea (visible if script mode OR showBothInputs) */}
          {(showBothInputs || inputMode === 'script') && (
            <div className='flex flex-col gap-1.5 mt-1'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='project-script'
                  className='text-xs font-medium text-gray-700 flex items-center gap-1.5'
                >
                  <FileTextIcon className='w-3.5 h-3.5 text-primary-600' />
                  <span>Pre-written / Generated Script (generatedScript)</span>
                  {!rawInputText.trim() && !isEditing && (
                    <span className='text-error-500'>*</span>
                  )}
                </Label>
                {scriptWords > 0 && (
                  <div className='flex items-center gap-2 text-[11px] text-gray-500'>
                    <span>{scriptWords} words</span>
                    <span>•</span>
                    <span>~{scriptEstMinutes}m read</span>
                    <button
                      type='button'
                      onClick={() =>
                        setRoughLengthInMins(
                          Math.max(0.5, parseFloat(scriptEstMinutes) || 1)
                        )
                      }
                      className='text-primary-600 hover:underline font-medium ml-1'
                      title='Set target duration to match script length'
                    >
                      Sync duration
                    </button>
                  </div>
                )}
              </div>
              <Textarea
                id='project-script'
                value={generatedScript}
                onChange={(e) => setGeneratedScript(e.target.value)}
                placeholder={'Paste complete pre-written script here...\n[Narrator]: Imagine a computer capable of solving in seconds calculations that take millions of years...\n[Visual]: Futuristic quantum laboratory...'}
                className='min-h-[150px] font-mono text-xs leading-relaxed'
                data-testid='project-script-input'
              />
              <span className='text-[11px] text-gray-400'>
                Pre-written script to skip AI script drafting and proceed directly to speech and visual production.
              </span>
            </div>
          )}
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
              onChange={(e) =>
                setRoughLengthInMins(parseFloat(e.target.value) || 0)
              }
              data-testid='project-length-input'
            />
            <span className='text-xs text-gray-400'>Estimated runtime in minutes</span>
          </div>

          {/* Project Type */}
          <div className='flex flex-col gap-2'>
            <Label htmlFor='project-type' className='font-medium text-gray-700'>
              Video Format / Type
            </Label>
            <Select
              value={type}
              onValueChange={(val) => setType(val as ProjectType)}
            >
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
              <SelectTrigger
                id='project-language'
                data-testid='select-language-trigger'
              >
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

        {/* Pipeline & Execution Status (Visible when editing) */}
        {isEditing && (
          <div className='border-t border-gray-100 pt-5 flex flex-col gap-3'>
            <div className='flex items-center justify-between'>
              <div>
                <Label htmlFor='project-status' className='font-medium text-gray-800 text-sm'>
                  Pipeline & Execution Status
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

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id='project-status' className='w-full' data-testid='select-status-trigger'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent className='max-h-72'>
                {VIDEO_PROJECT_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className='flex flex-col text-left py-0.5'>
                      <span className='font-medium text-gray-900 text-xs'>{opt.label} ({opt.value})</span>
                      <span className='text-[11px] text-gray-500'>{opt.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Publishing Status & Link Options */}
        <div className='border-t border-gray-100 pt-5 flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-semibold text-gray-800'>
              Publishing Status
            </h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isPublished
                  ? 'bg-success-50 text-success-700 border border-success-200'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isPublished ? 'Published' : 'Draft / Unpublished'}
            </span>
          </div>

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

          {/* Published Video Link Input */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <Label
                htmlFor='project-published-link'
                className='text-xs font-medium text-gray-700 flex items-center gap-1.5'
              >
                <LinkIcon className='w-3.5 h-3.5 text-gray-500' />
                <span>Published Video Link (YouTube, Vimeo, TikTok, etc.)</span>
              </Label>
              {publishedLink.trim() && (
                <a
                  href={
                    publishedLink.startsWith('http://') ||
                    publishedLink.startsWith('https://')
                      ? publishedLink
                      : `https://${publishedLink}`
                  }
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-1 font-normal'
                  title='Open URL in new tab to verify'
                >
                  <span>Test Link</span>
                  <ExternalLinkIcon className='w-3 h-3' />
                </a>
              )}
            </div>

            <div className='relative'>
              <Input
                id='project-published-link'
                type='url'
                value={publishedLink}
                onChange={(e) => {
                  const val = e.target.value;
                  setPublishedLink(val);
                  if (val.trim() && !isPublished) {
                    setIsPublished(true);
                  }
                }}
                placeholder='https://youtube.com/watch?v=...'
                className='h-9 text-sm'
                data-testid='project-published-link-input'
              />
            </div>
            <span className='text-xs text-gray-400'>
              Save the final public or private video URL to track published assets. Entering a link automatically marks the project as published.
            </span>
          </div>
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

export default ProjectForm;
