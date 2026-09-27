import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ImageIcon,
  ZoomInIcon,
  ZoomOutIcon,
  RotateCcwIcon,
  Maximize2Icon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  PenIcon,
  ShieldCheckIcon,
  LayersIcon,
  InfoIcon,
} from 'lucide-react';
import { Persona } from '@/types/persona';
import { Button } from '@/components/ui/button';
import {
  copyToClipboard,
  resolveAssetUrl,
  getFileName,
  getFileExtension,
} from './assetHelper';

interface PersonaCharacterSheetTabProps {
  persona: Persona;
}

export const PersonaCharacterSheetTab = ({
  persona,
}: PersonaCharacterSheetTabProps) => {
  const [zoom, setZoom] = useState<number>(100);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const characterSheetUrl = resolveAssetUrl(persona.characterSheetPath);
  const fileName = getFileName(persona.characterSheetPath);
  const ext = getFileExtension(persona.characterSheetPath);

  const handleCopyPath = () => {
    if (persona.characterSheetPath) {
      copyToClipboard(persona.characterSheetPath, 'Character Sheet Path');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <div className='space-y-6'>
      {/* Header Banner */}
      <div className='p-5 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0'>
              <ImageIcon className='w-5 h-5' />
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-900'>
                Character Sheet Image
              </h2>
              <p className='text-xs text-gray-500'>
                Multi-angle model sheet reference for visual character identity locking
              </p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {persona.characterSheetPath ? (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200'>
              Configured
            </span>
          ) : (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200'>
              Not Configured
            </span>
          )}

          <Button asChild size='sm' variant='secondary-gray' className='text-xs shrink-0'>
            <Link to={`/dashboard/persona-form?personaId=${persona.id}`}>
              <PenIcon className='w-3.5 h-3.5 mr-1.5' />
              {persona.characterSheetPath ? 'Change Image' : 'Upload Image'}
            </Link>
          </Button>
        </div>
      </div>

      {persona.characterSheetPath ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Character Sheet Stage (2 Cols) */}
          <div className='lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs flex flex-col'>
            {/* Stage Controls Toolbar */}
            <div className='p-3.5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between gap-2 flex-wrap'>
              <div className='flex items-center gap-1.5 text-xs text-gray-600 font-medium'>
                <span className='font-mono truncate max-w-xs' title={persona.characterSheetPath}>
                  {fileName}
                </span>
                {ext && (
                  <span className='px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-200 text-gray-700'>
                    .{ext}
                  </span>
                )}
              </div>

              <div className='flex items-center gap-1.5'>
                <button
                  type='button'
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className='p-1.5 rounded-md hover:bg-gray-200 text-gray-600 disabled:opacity-40 transition-colors'
                  title='Zoom Out'
                >
                  <ZoomOutIcon className='w-4 h-4' />
                </button>
                <span className='text-xs font-mono font-medium text-gray-600 w-12 text-center'>
                  {zoom}%
                </span>
                <button
                  type='button'
                  onClick={handleZoomIn}
                  disabled={zoom >= 250}
                  className='p-1.5 rounded-md hover:bg-gray-200 text-gray-600 disabled:opacity-40 transition-colors'
                  title='Zoom In'
                >
                  <ZoomInIcon className='w-4 h-4' />
                </button>
                <button
                  type='button'
                  onClick={handleResetZoom}
                  className='p-1.5 rounded-md hover:bg-gray-200 text-gray-600 transition-colors'
                  title='Reset Zoom (100%)'
                >
                  <RotateCcwIcon className='w-3.5 h-3.5' />
                </button>

                <div className='h-4 w-px bg-gray-300 mx-1' />

                {characterSheetUrl && (
                  <>
                    <button
                      type='button'
                      onClick={() => setIsLightboxOpen(true)}
                      className='p-1.5 rounded-md hover:bg-gray-200 text-gray-600 transition-colors'
                      title='Fullscreen Lightbox'
                    >
                      <Maximize2Icon className='w-4 h-4' />
                    </button>
                    <a
                      href={characterSheetUrl}
                      target='_blank'
                      rel='noreferrer'
                      className='p-1.5 rounded-md hover:bg-gray-200 text-gray-600 transition-colors'
                      title='Open in new tab'
                    >
                      <ExternalLinkIcon className='w-4 h-4' />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Image Canvas / Viewport */}
            <div className='relative flex-1 min-h-[460px] bg-slate-900/95 flex items-center justify-center p-6 overflow-auto'>
              {!imageError && characterSheetUrl ? (
                <div
                  className='transition-transform duration-200 ease-out origin-center flex items-center justify-center'
                  style={{ transform: `scale(${zoom / 100})` }}
                >
                  <img
                    src={characterSheetUrl}
                    alt={`${persona.name} Character Sheet`}
                    className='max-h-[500px] w-auto object-contain rounded-lg shadow-2xl border border-white/10'
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className='text-center p-8 max-w-md space-y-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm'>
                  <div className='w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto'>
                    <InfoIcon className='w-6 h-6' />
                  </div>
                  <h4 className='text-sm font-semibold text-white'>
                    Local File Path Configured
                  </h4>
                  <p className='text-xs text-gray-300 leading-relaxed font-mono break-all'>
                    {persona.characterSheetPath}
                  </p>
                  <p className='text-xs text-gray-400 leading-relaxed'>
                    This file is referenced by the generation engine from the local filesystem. To preview directly in browser, host the file under a web-accessible URL or public assets directory.
                  </p>
                  <button
                    type='button'
                    onClick={handleCopyPath}
                    className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors'
                  >
                    {copied ? (
                      <CheckIcon className='w-3.5 h-3.5 text-success-400' />
                    ) : (
                      <CopyIcon className='w-3.5 h-3.5' />
                    )}
                    <span>Copy File Path</span>
                  </button>
                </div>
              )}
            </div>

            {/* Path details footer */}
            <div className='p-3.5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between text-xs text-gray-500'>
              <div className='flex items-center gap-2 truncate'>
                <span className='font-semibold text-gray-700 shrink-0'>File:</span>
                <span className='font-mono truncate' title={persona.characterSheetPath}>
                  {persona.characterSheetPath}
                </span>
              </div>
              <button
                type='button'
                onClick={handleCopyPath}
                className='text-primary-600 hover:text-primary-700 font-medium shrink-0 flex items-center gap-1'
              >
                {copied ? (
                  <>
                    <CheckIcon className='w-3.5 h-3.5 text-success-600' />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className='w-3.5 h-3.5' />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Guidelines & Persona Specs Side Panel (1 Col) */}
          <div className='space-y-6'>
            {/* Identity Locking Card */}
            <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4'>
              <div className='flex items-center gap-2 text-primary-700 font-bold text-sm'>
                <ShieldCheckIcon className='w-4 h-4' />
                <h3>Visual Character Consistency</h3>
              </div>
              <p className='text-xs text-gray-600 leading-relaxed'>
                AI diffusion models often suffer from character drift (face morphing, inconsistent outfits) between scene parts. A character sheet locks identity by providing canonical turnaround perspectives.
              </p>

              <div className='space-y-3 pt-2 border-t border-gray-100'>
                <h4 className='text-xs font-semibold text-gray-800 uppercase tracking-wider'>
                  Core Sheet Elements
                </h4>

                <div className='space-y-2 text-xs text-gray-600'>
                  <div className='p-2.5 rounded-lg bg-gray-50 border border-gray-100'>
                    <span className='font-semibold text-gray-900 block mb-0.5'>
                      1. Turnaround Perspectives
                    </span>
                    <span className='text-gray-500 text-[11px] leading-relaxed'>
                      Front view, 3/4 profile, side profile, and back view to orient camera motion.
                    </span>
                  </div>

                  <div className='p-2.5 rounded-lg bg-gray-50 border border-gray-100'>
                    <span className='font-semibold text-gray-900 block mb-0.5'>
                      2. Facial Expressions
                    </span>
                    <span className='text-gray-500 text-[11px] leading-relaxed'>
                      Neutral, smiling, skeptical, and talking expressions for emotion cues.
                    </span>
                  </div>

                  <div className='p-2.5 rounded-lg bg-gray-50 border border-gray-100'>
                    <span className='font-semibold text-gray-900 block mb-0.5'>
                      3. Wardrobe & Accessories
                    </span>
                    <span className='text-gray-500 text-[11px] leading-relaxed'>
                      Signature clothing, colors, glasses, or hairstyles locked across all video cuts.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3'>
              <h4 className='text-xs font-semibold text-gray-800 uppercase tracking-wider'>
                Actions
              </h4>
              <div className='space-y-2'>
                <Button
                  asChild
                  variant='secondary-gray'
                  size='sm'
                  className='w-full text-xs justify-start'
                >
                  <Link to={`/dashboard/persona-form?personaId=${persona.id}`}>
                    <PenIcon className='w-3.5 h-3.5 mr-2' />
                    Replace Character Sheet
                  </Link>
                </Button>

                <Button
                  asChild
                  size='sm'
                  className='w-full text-xs bg-primary-600 hover:bg-primary-700 text-white justify-start'
                >
                  <Link to={`/dashboard/project-form?personaId=${persona.id}`}>
                    <LayersIcon className='w-3.5 h-3.5 mr-2' />
                    New Project with this Persona
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className='bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center max-w-2xl mx-auto space-y-4'>
          <div className='w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs'>
            <ImageIcon className='w-7 h-7' />
          </div>
          <h3 className='text-base font-bold text-gray-900'>
            No Character Sheet Configured
          </h3>
          <p className='text-xs text-gray-500 max-w-md mx-auto leading-relaxed'>
            A Character Sheet provides 360° turnarounds and expression references for{' '}
            <strong className='text-gray-800'>{persona.name}</strong>, ensuring high visual fidelity without character face drift during video generation.
          </p>

          <div className='pt-2'>
            <Button asChild size='sm' className='bg-primary-600 hover:bg-primary-700 text-white text-xs'>
              <Link to={`/dashboard/persona-form?personaId=${persona.id}`}>
                <PenIcon className='w-3.5 h-3.5 mr-1.5' />
                Configure Character Sheet
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && characterSheetUrl && (
        <div
          role='dialog'
          aria-modal='true'
          className='fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4'
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className='relative max-w-5xl max-h-[92vh] bg-white rounded-xl overflow-hidden shadow-2xl p-2'
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={characterSheetUrl}
              alt={`${persona.name} Character Sheet Fullsize`}
              className='max-h-[82vh] w-auto object-contain mx-auto rounded-lg'
            />
            <div className='mt-2.5 flex items-center justify-between px-3 text-xs text-gray-600'>
              <span className='font-semibold'>{persona.name} Character Sheet</span>
              <button
                type='button'
                onClick={() => setIsLightboxOpen(false)}
                className='px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium'
              >
                Close Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaCharacterSheetTab;
