import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  PaletteIcon,
  FilmIcon,
  UserIcon,
  CopyIcon,
  CheckIcon,
  PenIcon,
  ExternalLinkIcon,
  Maximize2Icon,
  AlertCircleIcon,
} from 'lucide-react';
import { Persona } from '@/types/persona';
import { Button } from '@/components/ui/button';
import {
  copyToClipboard,
  resolveAssetUrl,
  getFileName,
  getFileExtension,
} from './assetHelper';

interface PersonaVisualFilesTabProps {
  persona: Persona;
}

export const PersonaVisualFilesTab = ({ persona }: PersonaVisualFilesTabProps) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [headPicError, setHeadPicError] = useState(false);

  const handleCopy = (text: string, key: string) => {
    copyToClipboard(text, key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const headPicUrl = resolveAssetUrl(persona.headPicturePath);

  const visualFiles = [
    {
      key: 'visualDna',
      title: 'Visual DNA File',
      path: persona.visualDnaPath,
      icon: PaletteIcon,
      badgeLabel: 'Aesthetics & Style',
      description:
        'Defines color grading palettes, lighting environments (cinematic, natural, neon), camera angles, aspect ratios, and visual tone to maintain visual harmony across scene cuts.',
      guidelines: [
        'Color Palette: Specific hex references or grading style (e.g., warm golden hour, cool moody teal & orange).',
        'Lighting Profile: Volumetric backlighting, soft studio diffusion, or high-contrast dramatic shadows.',
        'Camera Motion: Slow cinematic pans, static tripod stability, or dynamic handheld tracking.',
        'Environment & Setting: Signature backgrounds, clean modern minimalism, or atmospheric studios.',
      ],
      sampleMock: `# VISUAL DNA: ${persona.name.toUpperCase()}
[Aesthetic]: High-end modern documentary, cinematic realism
[Lighting]: 3-point studio lighting, subtle warm hair rim light
[Color Grade]: Muted filmic tones, deep blacks, rich skin tones
[Camera Framing]: Medium close-up, 50mm f/1.8 shallow depth of field
[Background]: Sleek ambient interior with soft bokeh`,
    },
    {
      key: 'videoPrompt',
      title: 'Video Generation Prompt',
      path: persona.videoPromptPath,
      icon: FilmIcon,
      badgeLabel: 'Diffusion Model Template',
      description:
        'Directs text-to-video and image-to-video generative models (e.g., Sora, Kling, Runway, SVD) on motion intensity, physics, transitions, and scene generation prompts.',
      guidelines: [
        'Motion Dynamics: Pacing of subject movements, subtle facial micro-expressions, and natural blinking.',
        'Scene Part Syncing: Correlating visual scene transitions with script narration timestamps.',
        'Negative Prompts: Filtering out distortions, morphing, extra limbs, and unnatural camera warps.',
        'Resolution & Framing: Default 1080p/4K aspect ratio targets and frame rates (24fps vs 30fps).',
      ],
      sampleMock: `SYSTEM PROMPT: VIDEO DIFFUSION GENERATOR
Input: Scene visual cue from Part {partIndex}
Reference: Persona Character Sheet + Head Picture
Instruction: Generate motion video clip with natural physics.
Prompt Template:
  "[SUBJECT: ${persona.name}], [ACTION: {sceneAction}],
   [LIGHTING: cinematic studio], [CAMERA: steady slow push-in],
   hyperrealistic, 4k, photorealistic, 24fps"`,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Intro Header */}
      <div className='p-5 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <h2 className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <SparklesIcon className='w-5 h-5 text-primary-600' />
            Visual Related Files & Assets
          </h2>
          <p className='text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed'>
            Configure visual branding, video diffusion model prompts, and head portrait references for{' '}
            <span className='font-semibold text-gray-800'>{persona.name}</span>. These files govern visual styling across all generated scene parts.
          </p>
        </div>

        <Button asChild size='sm' variant='secondary-gray' className='text-xs shrink-0'>
          <Link to={`/dashboard/persona-form?personaId=${persona.id}`}>
            <PenIcon className='w-3.5 h-3.5 mr-1.5' />
            Edit Visual Assets
          </Link>
        </Button>
      </div>

      {/* Head Picture Portrait Feature Card */}
      <div className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs'>
        <div className='p-5 border-b border-gray-100 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0'>
              <UserIcon className='w-5 h-5' />
            </div>
            <div>
              <h3 className='text-sm font-bold text-gray-900'>
                Head Picture / Portrait Reference
              </h3>
              <p className='text-xs text-gray-500'>
                Primary face reference for talking head generation, lip sync, and avatar consistency
              </p>
            </div>
          </div>

          {persona.headPicturePath ? (
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200 shrink-0'>
              Configured
            </span>
          ) : (
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 shrink-0'>
              Not Set
            </span>
          )}
        </div>

        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 items-center'>
            {/* Image Preview Box */}
            <div className='md:col-span-1 flex flex-col items-center justify-center'>
              {persona.headPicturePath && !headPicError && headPicUrl ? (
                <div className='relative group rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm bg-gray-50 max-w-[200px] w-full aspect-square'>
                  <img
                    src={headPicUrl}
                    alt={`${persona.name} headshot`}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                    onError={() => setHeadPicError(true)}
                  />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                    <button
                      type='button'
                      onClick={() => setIsLightboxOpen(true)}
                      className='p-1.5 rounded-full bg-white/90 text-gray-800 hover:bg-white shadow'
                      title='Enlarge portrait'
                    >
                      <Maximize2Icon className='w-4 h-4' />
                    </button>
                    <a
                      href={headPicUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='p-1.5 rounded-full bg-white/90 text-gray-800 hover:bg-white shadow'
                      title='Open in new tab'
                    >
                      <ExternalLinkIcon className='w-4 h-4' />
                    </a>
                  </div>
                </div>
              ) : (
                <div className='w-full max-w-[200px] aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center p-4'>
                  <UserIcon className='w-12 h-12 text-gray-300 mb-2' />
                  <p className='text-xs text-gray-400 font-medium'>
                    {persona.headPicturePath
                      ? 'Local file path configured (preview unavailable via HTTP)'
                      : 'No head picture uploaded'}
                  </p>
                </div>
              )}
            </div>

            {/* Path and Details */}
            <div className='md:col-span-2 space-y-4'>
              <div>
                <label className='text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1'>
                  Head Picture File Path
                </label>
                {persona.headPicturePath ? (
                  <div className='flex items-center justify-between gap-2 p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-gray-800'>
                    <span className='truncate' title={persona.headPicturePath}>
                      {persona.headPicturePath}
                    </span>
                    <button
                      type='button'
                      onClick={() => handleCopy(persona.headPicturePath!, 'Head Picture Path')}
                      className='text-gray-400 hover:text-primary-600 transition-colors p-1 shrink-0'
                      title='Copy path'
                    >
                      {copiedKey === 'Head Picture Path' ? (
                        <CheckIcon className='w-4 h-4 text-success-600' />
                      ) : (
                        <CopyIcon className='w-4 h-4' />
                      )}
                    </button>
                  </div>
                ) : (
                  <p className='text-xs text-gray-400 italic'>
                    No head picture path provided. Add a portrait photo in the Persona form.
                  </p>
                )}
              </div>

              <div className='space-y-1.5 text-xs text-gray-600'>
                <span className='font-semibold text-gray-800 block'>
                  Recommended Headshot Specifications:
                </span>
                <ul className='space-y-1 list-disc list-inside text-gray-500'>
                  <li>Front-facing portrait with clear eyes and neutral mouth expression.</li>
                  <li>Even, soft lighting with high contrast against a neutral backdrop.</li>
                  <li>Square aspect ratio (1:1), minimum 1024x1024 resolution.</li>
                  <li>Format: PNG, JPG, or WEBP.</li>
                </ul>
              </div>

              <div className='pt-2'>
                <Button asChild variant='secondary-gray' size='sm' className='text-xs'>
                  <Link to={`/dashboard/persona-form?personaId=${persona.id}`}>
                    <PenIcon className='w-3 h-3 mr-1.5' />
                    {persona.headPicturePath ? 'Update Head Picture' : 'Upload Head Picture'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual DNA & Video Prompt Cards */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {visualFiles.map((file) => {
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
                      <span>No file configured for {file.title}. Click "Edit" to configure.</span>
                    </div>
                  )}
                </div>

                {/* Guidelines */}
                <div className='space-y-1.5'>
                  <span className='text-[11px] font-semibold text-gray-700 block'>
                    Aesthetic Controls & Parameters:
                  </span>
                  <ul className='space-y-1'>
                    {file.guidelines.map((item, idx) => (
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

                {/* Preview Box */}
                <div>
                  <div className='flex items-center justify-between text-[11px] text-gray-500 mb-1 font-mono'>
                    <span>Specification Preview</span>
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
                  {isConfigured ? 'Active in video rendering' : 'Optional visual template'}
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

      {/* Lightbox Modal */}
      {isLightboxOpen && headPicUrl && (
        <div
          role='dialog'
          aria-modal='true'
          className='fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4'
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className='relative max-w-xl max-h-[85vh] bg-white rounded-xl overflow-hidden shadow-2xl p-2'
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={headPicUrl}
              alt={`${persona.name} head picture`}
              className='max-h-[75vh] w-auto object-contain mx-auto rounded-lg'
            />
            <div className='mt-2 flex items-center justify-between px-2 text-xs text-gray-600'>
              <span className='font-semibold'>{persona.name} Portrait</span>
              <button
                type='button'
                onClick={() => setIsLightboxOpen(false)}
                className='px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaVisualFilesTab;
