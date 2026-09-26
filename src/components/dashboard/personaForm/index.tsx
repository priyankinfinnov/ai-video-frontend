import { FormEvent, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, PlusIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/store/store';
import {
  useCreatePersonaMutation,
  useUpdatePersonaMutation,
} from '@/queries/personaActions';
import { CreatePersonaRequest, Persona } from '@/types/persona';

interface PersonaFormProps {
  isEditing?: boolean;
  isCloning?: boolean;
  initialData?: Persona;
}

export const PersonaForm = ({
  isEditing = false,
  isCloning = false,
  initialData,
}: PersonaFormProps) => {
  const navigate = useNavigate();
  const token = useAppSelector((store) => store.auth.token);

  const [name, setName] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState<string[]>([]);

  // Asset & DNA paths
  const [characterSheetPath, setCharacterSheetPath] = useState('');
  const [headPicturePath, setHeadPicturePath] = useState('');
  const [referenceAudioPath, setReferenceAudioPath] = useState('');
  const [writingDnaPath, setWritingDnaPath] = useState('');
  const [visualDnaPath, setVisualDnaPath] = useState('');
  const [scriptPromptPath, setScriptPromptPath] = useState('');
  const [videoPromptPath, setVideoPromptPath] = useState('');
  const [scriptJudgePath, setScriptJudgePath] = useState('');

  const { mutate: createPersona, isLoading: isCreating } =
    useCreatePersonaMutation(token);
  const { mutate: updatePersona, isLoading: isUpdating } =
    useUpdatePersonaMutation(initialData?.id, token);

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (initialData) {
      setName(
        initialData.name
          ? isCloning
            ? `${initialData.name} (Copy)`
            : initialData.name
          : ''
      );
      setTopics(initialData.topics ? [...initialData.topics] : []);
      setCharacterSheetPath(initialData.characterSheetPath || '');
      setHeadPicturePath(initialData.headPicturePath || '');
      setReferenceAudioPath(initialData.referenceAudioPath || '');
      setWritingDnaPath(initialData.writingDnaPath || '');
      setVisualDnaPath(initialData.visualDnaPath || '');
      setScriptPromptPath(initialData.scriptPromptPath || '');
      setVideoPromptPath(initialData.videoPromptPath || '');
      setScriptJudgePath(initialData.scriptJudgePath || '');
    }
  }, [initialData, isCloning]);

  const handleAddTopic = () => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    if (topics.includes(trimmed)) {
      toast.error('Topic already added');
      return;
    }
    setTopics([...topics, trimmed]);
    setTopicInput('');
  };

  const handleRemoveTopic = (indexToRemove: number) => {
    setTopics(topics.filter((_, idx) => idx !== indexToRemove));
  };

  const handleTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Please enter a persona name');
      return;
    }

    // Include any pending topic in input
    const finalTopics = [...topics];
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      finalTopics.push(topicInput.trim());
      setTopics(finalTopics);
      setTopicInput('');
    }

    if (finalTopics.length === 0) {
      toast.error('Please add at least one topic for this persona');
      return;
    }

    const payload: CreatePersonaRequest = {
      name: trimmedName,
      topics: finalTopics,
      ...(characterSheetPath.trim() ? { characterSheetPath: characterSheetPath.trim() } : {}),
      ...(headPicturePath.trim() ? { headPicturePath: headPicturePath.trim() } : {}),
      ...(referenceAudioPath.trim() ? { referenceAudioPath: referenceAudioPath.trim() } : {}),
      ...(writingDnaPath.trim() ? { writingDnaPath: writingDnaPath.trim() } : {}),
      ...(visualDnaPath.trim() ? { visualDnaPath: visualDnaPath.trim() } : {}),
      ...(scriptPromptPath.trim() ? { scriptPromptPath: scriptPromptPath.trim() } : {}),
      ...(videoPromptPath.trim() ? { videoPromptPath: videoPromptPath.trim() } : {}),
      ...(scriptJudgePath.trim() ? { scriptJudgePath: scriptJudgePath.trim() } : {}),
    };

    if (isEditing && initialData?.id) {
      updatePersona(payload, {
        onSuccess: () => navigate('/dashboard'),
      });
    } else {
      createPersona(payload, {
        onSuccess: () => navigate('/dashboard'),
      });
    }
  };

  return (
    <div className='max-w-4xl mx-auto py-8 px-4 sm:px-6'>
      <div className='flex items-center justify-between mb-8'>
        <button
          onClick={() => navigate('/dashboard')}
          className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors'
        >
          <ArrowLeftIcon className='w-4 h-4' />
          <span>Back to Personas</span>
        </button>
      </div>

      <div className='bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8'>
        <div className='border-b border-gray-100 pb-5 mb-6'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            {isEditing
              ? 'Edit Persona'
              : isCloning
              ? 'Clone Persona'
              : 'Create New Persona'}
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            {isEditing
              ? 'Update the parameters and DNA paths for this creator persona.'
              : isCloning
              ? 'Create a new persona cloned from an existing configuration. Edit any details before saving.'
              : 'Configure a new AI creator persona with topical expertise and voice/visual DNA.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Core Info */}
          <div className='grid grid-cols-1 gap-6'>
            <div>
              <Label htmlFor='persona-name' className='text-sm font-medium text-gray-700'>
                Persona Name <span className='text-error-500'>*</span>
              </Label>
              <Input
                id='persona-name'
                name='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g., Tech Explainer, Finance Guru'
                required
                className='mt-1.5'
              />
            </div>

            {/* Topics */}
            <div>
              <Label htmlFor='persona-topics' className='text-sm font-medium text-gray-700'>
                Topics & Niches <span className='text-error-500'>*</span>
              </Label>
              <p className='text-xs text-gray-500 mt-0.5 mb-2'>
                Type a topic and press Enter or comma to add.
              </p>
              <div className='flex gap-2'>
                <Input
                  id='persona-topics'
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={handleTopicKeyDown}
                  placeholder='e.g. AI Developments, Quantum Computing'
                  className='flex-1'
                />
                <Button
                  type='button'
                  onClick={handleAddTopic}
                  variant='secondary-gray'
                  size='md'
                  className='flex items-center gap-1.5 shrink-0'
                >
                  <PlusIcon className='w-4 h-4' />
                  <span>Add Topic</span>
                </Button>
              </div>

              {topics.length > 0 && (
                <div className='flex flex-wrap gap-2 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200'>
                  {topics.map((topic, idx) => (
                    <Badge
                      key={idx}
                      variant='default'
                      className='flex items-center gap-1.5 py-1 px-2.5 text-xs'
                    >
                      <span>{topic}</span>
                      <button
                        type='button'
                        onClick={() => handleRemoveTopic(idx)}
                        className='text-primary-700 hover:text-error-500 focus:outline-none'
                        aria-label={`Remove topic ${topic}`}
                      >
                        <XIcon className='w-3 h-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DNA & Model Assets Section */}
          <div className='pt-6 border-t border-gray-100'>
            <h2 className='text-base font-semibold text-gray-900 mb-1'>
              Asset & DNA Configuration (Optional)
            </h2>
            <p className='text-xs text-gray-500 mb-5'>
              Specify filesystem paths or cloud URLs to associate multimodal DNA with this persona.
            </p>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='characterSheetPath' className='text-xs font-medium text-gray-700'>
                  Character Sheet Path
                </Label>
                <Input
                  id='characterSheetPath'
                  value={characterSheetPath}
                  onChange={(e) => setCharacterSheetPath(e.target.value)}
                  placeholder='/assets/personas/sheet.png'
                  className='mt-1 text-sm'
                />
              </div>

              <div>
                <Label htmlFor='headPicturePath' className='text-xs font-medium text-gray-700'>
                  Head Picture Path
                </Label>
                <Input
                  id='headPicturePath'
                  value={headPicturePath}
                  onChange={(e) => setHeadPicturePath(e.target.value)}
                  placeholder='/assets/personas/avatar.png'
                  className='mt-1 text-sm'
                />
              </div>

              <div>
                <Label htmlFor='referenceAudioPath' className='text-xs font-medium text-gray-700'>
                  Reference Audio Path
                </Label>
                <Input
                  id='referenceAudioPath'
                  value={referenceAudioPath}
                  onChange={(e) => setReferenceAudioPath(e.target.value)}
                  placeholder='/assets/personas/voice.wav'
                  className='mt-1 text-sm'
                />
              </div>

              <div>
                <Label htmlFor='writingDnaPath' className='text-xs font-medium text-gray-700'>
                  Writing DNA Path
                </Label>
                <Input
                  id='writingDnaPath'
                  value={writingDnaPath}
                  onChange={(e) => setWritingDnaPath(e.target.value)}
                  placeholder='/prompts/dna/writing.md'
                  className='mt-1 text-sm'
                />
              </div>

              <div>
                <Label htmlFor='visualDnaPath' className='text-xs font-medium text-gray-700'>
                  Visual DNA Path
                </Label>
                <Input
                  id='visualDnaPath'
                  value={visualDnaPath}
                  onChange={(e) => setVisualDnaPath(e.target.value)}
                  placeholder='/prompts/dna/visual.md'
                  className='mt-1 text-sm'
                />
              </div>

              <div>
                <Label htmlFor='scriptPromptPath' className='text-xs font-medium text-gray-700'>
                  Script Prompt Path
                </Label>
                <Input
                  id='scriptPromptPath'
                  value={scriptPromptPath}
                  onChange={(e) => setScriptPromptPath(e.target.value)}
                  placeholder='/prompts/script_prompt.txt'
                  className='mt-1 text-sm'
                />
              </div>

              <div>
                <Label htmlFor='videoPromptPath' className='text-xs font-medium text-gray-700'>
                  Video Prompt Path
                </Label>
                <Input
                  id='videoPromptPath'
                  value={videoPromptPath}
                  onChange={(e) => setVideoPromptPath(e.target.value)}
                  placeholder='/prompts/video_prompt.txt'
                  className='mt-1 text-sm'
                />
              </div>

              <div>
                <Label htmlFor='scriptJudgePath' className='text-xs font-medium text-gray-700'>
                  Script Judge Path
                </Label>
                <Input
                  id='scriptJudgePath'
                  value={scriptJudgePath}
                  onChange={(e) => setScriptJudgePath(e.target.value)}
                  placeholder='/prompts/judge.txt'
                  className='mt-1 text-sm'
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className='flex items-center justify-end gap-3 pt-6 border-t border-gray-100'>
            <Button
              type='button'
              variant='secondary-gray'
              size='md'
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              size='md'
              disabled={isSubmitting}
              className='min-w-[120px]'
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Persona'
                : 'Create Persona'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonaForm;
