import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileTextIcon,
  SparklesIcon,
  CopyIcon,
  CheckIcon,
  PenIcon,
  BookOpenIcon,
  LayersIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { Persona } from '@/types/persona';
import { Button } from '@/components/ui/button';
import { copyToClipboard, getFileName, getFileExtension } from './assetHelper';

interface PersonaScriptFilesTabProps {
  persona: Persona;
}

export const PersonaScriptFilesTab = ({ persona }: PersonaScriptFilesTabProps) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text, key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const scriptFiles = [
    {
      key: 'writingDna',
      title: 'Writing DNA File',
      path: persona.writingDnaPath,
      icon: BookOpenIcon,
      accentColor: 'blue',
      badgeLabel: 'Voice & Cadence',
      description:
        'Encodes the creator’s authentic tone, vocabulary, sentence rhythm, humor, rhetorical patterns, and structural preferences so generated scripts match their unique style.',
      guidance: [
        'Tone & Persona Cadence: Direct, punchy, conversational, or educational.',
        'Vocabulary Rules: Preferred industry phrases, forbidden buzzwords, and signature slang.',
        'Sentence Length Variation: Balancing short impact hooks with explanatory exposition.',
        'Signature Hooks & Outros: Recurring greeting formulas, transitions, and calls to action.',
      ],
      sampleMock: `# WRITING DNA: ${persona.name.toUpperCase()}
[Tone]: Direct, intellectually curious, accessible, high energy
[Cadence]: Short punchy opening sentences (under 10 words)
[Vocabulary]: Prefer concrete metaphors; avoid corporate jargon
[Perspective]: 1st-person narrator speaking directly to viewer ("you")
[Signature Transition]: "Here is what nobody is talking about..."`,
    },
    {
      key: 'scriptPrompt',
      title: 'Script Generation Prompt',
      path: persona.scriptPromptPath,
      icon: SparklesIcon,
      accentColor: 'purple',
      badgeLabel: 'System Prompt Template',
      description:
        'The foundational instructions sent to the LLM to structure video scripts, divide them into sequenced scene parts, enforce rough minute targets, and inject hooks.',
      guidance: [
        'Part Decomposition: Dividing raw input text into 3-5 logical storytelling segments.',
        'Timing Constraints: Calibrating word counts for standard speaking speed (140-160 WPM).',
        'Visual Cues & Actions: Directing camera angles and scene descriptions alongside narration.',
        'Retention Hooks: Injecting curiosity loops before scene transitions to prevent viewer drop-off.',
      ],
      sampleMock: `SYSTEM PROMPT: VIDEO SCRIPT GENERATOR
You are the lead scriptwriter for creator "${persona.name}".
Input: Raw topic text or article source
Constraint: Generate a multi-part script adhering to rough target length.
Structure:
  [Part 1]: 3-second hook + problem statement
  [Part 2-N]: Core explanation with visual cues [VISUAL: ...]
  [Final Part]: Climax takeaway + call to action`,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Intro Header */}
      <div className='p-5 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h2 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <FileTextIcon className='w-5 h-5 text-primary-600' />
            Script Related Files
          </h2>
          <p className='text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed'>
            These template files configure the AI scriptwriting engine for{' '}
            <span className='font-semibold text-gray-800'>{persona.name}</span>. Writing DNA defines the creator's voice, while the Script Prompt directs narrative structure and parts splitting.
          </p>
        </div>

        <Button asChild size='sm' variant='secondary-gray' className='text-xs shrink-0'>
          <Link to={`/dashboard/persona-form?personaId=${persona.id}`}>
            <PenIcon className='w-3.5 h-3.5 mr-1.5' />
            Edit Script Files
          </Link>
        </Button>
      </div>

      {/* Script Files Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {scriptFiles.map((file) => {
          const Icon = file.icon;
          const isConfigured = !!file.path;
          const ext = getFileExtension(file.path);
          const fileName = getFileName(file.path);

          return (
            <div
              key={file.key}
              className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs flex flex-col justify-between'
            >
              {/* Card Header */}
              <div className='p-5 border-b border-gray-100 space-y-3'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex items-center gap-2.5'>
                    <div className='w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0'>
                      <Icon className='w-5 h-5' />
                    </div>
                    <div>
                      <h3 className='text-sm font-bold text-gray-900'>
                        {file.title}
                      </h3>
                      <span className='text-[11px] font-medium text-gray-500'>
                        {file.badgeLabel}
                      </span>
                    </div>
                  </div>

                  {isConfigured ? (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200 shrink-0'>
                      Configured
                    </span>
                  ) : (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 shrink-0'>
                      Not Set
                    </span>
                  )}
                </div>

                <p className='text-xs text-gray-600 leading-relaxed'>
                  {file.description}
                </p>
              </div>

              {/* Path Display */}
              <div className='p-5 space-y-4 flex-1'>
                <div>
                  <label className='text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5'>
                    Configured File Path
                  </label>
                  {isConfigured ? (
                    <div className='flex items-center justify-between gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-gray-800'>
                      <div className='flex items-center gap-2 truncate'>
                        {ext && (
                          <span className='px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-primary-100 text-primary-800 shrink-0'>
                            .{ext}
                          </span>
                        )}
                        <span className='truncate' title={file.path!}>
                          {file.path}
                        </span>
                      </div>
                      <button
                        type='button'
                        onClick={() => handleCopy(file.path!, file.title)}
                        className='text-gray-400 hover:text-primary-600 transition-colors p-1 shrink-0'
                        title='Copy path'
                      >
                        {copiedKey === file.title ? (
                          <CheckIcon className='w-4 h-4 text-success-600' />
                        ) : (
                          <CopyIcon className='w-4 h-4' />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className='flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-xs text-gray-400 italic'>
                      <AlertCircleIcon className='w-4 h-4 text-gray-400 shrink-0' />
                      <span>No file path configured for {file.title}. Click "Edit" to provide a file path.</span>
                    </div>
                  )}
                </div>

                {/* Expected Elements / Blueprint */}
                <div className='space-y-1.5'>
                  <span className='text-[11px] font-semibold text-gray-700 block'>
                    Pipeline Specifications & Structure:
                  </span>
                  <ul className='space-y-1'>
                    {file.guidance.map((item, idx) => (
                      <li
                        key={idx}
                        className='text-xs text-gray-500 flex items-start gap-1.5'
                      >
                        <span className='w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 shrink-0' />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prompt Inspector Box */}
                <div>
                  <div className='flex items-center justify-between text-[11px] text-gray-500 mb-1 font-mono'>
                    <span>Template Structure Preview</span>
                    <span>{fileName || 'default.txt'}</span>
                  </div>
                  <pre className='p-3 bg-gray-900 text-gray-200 text-[11px] font-mono rounded-lg overflow-x-auto leading-relaxed border border-gray-800 max-h-36'>
                    {file.sampleMock}
                  </pre>
                </div>
              </div>

              {/* Card Footer */}
              <div className='p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between'>
                <span className='text-xs text-gray-500'>
                  {isConfigured ? 'Active in script generation' : 'Optional prompt template'}
                </span>
                <Button
                  asChild
                  variant='tertiary-gray'
                  size='sm'
                  className='text-xs text-primary-600 hover:text-primary-700 h-7'
                >
                  <Link to={`/dashboard/persona-form?personaId=${persona.id}`}>
                    <PenIcon className='w-3 h-3 mr-1' />
                    {isConfigured ? 'Change Path' : 'Set Path'}
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Interplay Card */}
      <div className='p-5 bg-gradient-to-r from-blue-50/50 to-primary-50/40 rounded-xl border border-blue-200 shadow-xs space-y-3'>
        <div className='flex items-center gap-2'>
          <LayersIcon className='w-5 h-5 text-blue-600' />
          <h3 className='text-sm font-bold text-gray-900'>
            How Script Files Interact in Video Production
          </h3>
        </div>
        <p className='text-xs text-gray-600 leading-relaxed max-w-3xl'>
          When you initiate video generation, the pipeline first extracts key points from your input text. It then executes the{' '}
          <strong className='text-gray-800'>Script Prompt</strong> while injecting the{' '}
          <strong className='text-gray-800'>Writing DNA</strong> guidelines to create a script with persona-authentic tone. Once drafted, the script is evaluated by the{' '}
          <strong className='text-gray-800'>Script Judge</strong> before reaching narration and video rendering.
        </p>
      </div>
    </div>
  );
};

export default PersonaScriptFilesTab;
