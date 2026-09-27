import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileTextIcon,
  SparklesIcon,
  ImageIcon,
  AwardIcon,
  Volume2Icon,
  CopyIcon,
  CheckIcon,
  PenIcon,
  ArrowRightIcon,
  FilmIcon,
} from 'lucide-react';
import { Persona } from '@/types/persona';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCreatedDate } from '@/utils/utils';
import {
  copyToClipboard,
  resolveAssetUrl,
  getFileName,
} from './assetHelper';

export type PersonaTabKey =
  | 'details'
  | 'integrations'
  | 'automations'
  | 'script-files'
  | 'visual-files'
  | 'character-sheet'
  | 'script-judge';

interface PersonaDetailsOverviewProps {
  persona: Persona;
  onSwitchTab: (tab: PersonaTabKey) => void;
}

export const PersonaDetailsOverview = ({
  persona,
  onSwitchTab,
}: PersonaDetailsOverviewProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    copyToClipboard(text, fieldName);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const assetList = [
    { key: 'characterSheetPath', label: 'Character Sheet', path: persona.characterSheetPath, tab: 'character-sheet' as PersonaTabKey },
    { key: 'headPicturePath', label: 'Head Picture', path: persona.headPicturePath, tab: 'visual-files' as PersonaTabKey },
    { key: 'referenceAudioPath', label: 'Reference Audio', path: persona.referenceAudioPath, tab: 'details' as PersonaTabKey },
    { key: 'writingDnaPath', label: 'Writing DNA', path: persona.writingDnaPath, tab: 'script-files' as PersonaTabKey },
    { key: 'visualDnaPath', label: 'Visual DNA', path: persona.visualDnaPath, tab: 'visual-files' as PersonaTabKey },
    { key: 'scriptPromptPath', label: 'Script Prompt', path: persona.scriptPromptPath, tab: 'script-files' as PersonaTabKey },
    { key: 'videoPromptPath', label: 'Video Prompt', path: persona.videoPromptPath, tab: 'visual-files' as PersonaTabKey },
    { key: 'scriptJudgePath', label: 'Script Judge', path: persona.scriptJudgePath, tab: 'script-judge' as PersonaTabKey },
  ];

  const configuredAssetsCount = assetList.filter((a) => !!a.path).length;
  const readinessPercent = Math.round((configuredAssetsCount / assetList.length) * 100);

  const headPicUrl = resolveAssetUrl(persona.headPicturePath);
  const audioUrl = resolveAssetUrl(persona.referenceAudioPath);

  return (
    <div className='space-y-6'>
      {/* Top Banner / Hero Card */}
      <div className='p-6 bg-gradient-to-r from-primary-50/70 via-purple-50/30 to-white rounded-xl border border-primary-100 shadow-sm'>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
          <div className='flex items-center gap-4'>
            {headPicUrl ? (
              <img
                src={headPicUrl}
                alt={persona.name}
                className='w-16 h-16 rounded-xl object-cover border-2 border-primary-200 shadow-sm bg-white shrink-0'
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className='w-16 h-16 rounded-xl bg-primary-600 text-white font-bold text-2xl flex items-center justify-center shadow-sm shrink-0'>
                {persona.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className='space-y-1.5'>
              <div className='flex items-center gap-2.5 flex-wrap'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>
                  {persona.name}
                </h2>
                <span className='font-mono text-xs font-semibold text-primary-800 bg-primary-100 px-2.5 py-0.5 rounded-md'>
                  ID #{persona.id}
                </span>
                <span className='text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md'>
                  Team #{persona.teamId}
                </span>
              </div>

              <div className='flex items-center gap-4 text-xs text-gray-500 flex-wrap'>
                <span>Created: {getCreatedDate(persona.createdAt)}</span>
                <span>•</span>
                <span>Last Updated: {getCreatedDate(persona.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Asset Completeness Widget */}
          <div className='w-full md:w-64 bg-white/80 backdrop-blur-sm p-3.5 rounded-lg border border-primary-100 shadow-xs'>
            <div className='flex items-center justify-between text-xs mb-1.5'>
              <span className='font-semibold text-gray-700'>Pipeline Assets</span>
              <span className='font-bold text-primary-700'>
                {configuredAssetsCount} / {assetList.length} ({readinessPercent}%)
              </span>
            </div>
            <div className='w-full bg-gray-200 h-2 rounded-full overflow-hidden'>
              <div
                className='bg-primary-600 h-full rounded-full transition-all duration-500'
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
            <p className='text-[11px] text-gray-400 mt-1'>
              {configuredAssetsCount === assetList.length
                ? 'All pipeline assets and DNA paths configured!'
                : `${assetList.length - configuredAssetsCount} optional files not yet configured`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Topics & Identity Voice */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Topics & Niches */}
        <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-sm font-semibold text-gray-900'>
                Topics & Niches
              </h3>
              <span className='text-xs text-gray-400'>
                {persona.topics.length} configured
              </span>
            </div>
            {persona.topics.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {persona.topics.map((topic, idx) => (
                  <Badge
                    key={idx}
                    variant='default'
                    className='text-xs py-1 px-3 bg-primary-50 text-primary-700 border border-primary-200 font-medium'
                  >
                    #{topic}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className='text-xs text-gray-400 italic'>
                No topics configured for this persona.
              </p>
            )}
          </div>

          <div className='mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500'>
            <span>Used by script generation for topical alignment</span>
            <Button
              asChild
              variant='tertiary-gray'
              size='sm'
              className='text-xs h-7 text-primary-600 hover:text-primary-700'
            >
              <Link to={`/dashboard/persona-form?personaId=${persona.id}`}>
                <PenIcon className='w-3 h-3 mr-1' />
                Edit Topics
              </Link>
            </Button>
          </div>
        </div>

        {/* Voice & Reference Audio */}
        <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between'>
          <div>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <Volume2Icon className='w-4 h-4 text-primary-600' />
                <h3 className='text-sm font-semibold text-gray-900'>
                  Voice Reference Audio
                </h3>
              </div>
              {persona.referenceAudioPath ? (
                <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-success-50 text-success-700 border border-success-200'>
                  Configured
                </span>
              ) : (
                <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500'>
                  Not Set
                </span>
              )}
            </div>

            {persona.referenceAudioPath ? (
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs'>
                  <span className='font-mono text-gray-700 truncate max-w-xs' title={persona.referenceAudioPath}>
                    {persona.referenceAudioPath}
                  </span>
                  <button
                    type='button'
                    onClick={() => handleCopy(persona.referenceAudioPath!, 'Audio Path')}
                    className='text-gray-500 hover:text-primary-600 transition-colors shrink-0 p-1'
                    title='Copy audio path'
                  >
                    {copiedField === 'Audio Path' ? (
                      <CheckIcon className='w-3.5 h-3.5 text-success-600' />
                    ) : (
                      <CopyIcon className='w-3.5 h-3.5' />
                    )}
                  </button>
                </div>

                {audioUrl && (
                  <div className='pt-1'>
                    <audio
                      src={audioUrl}
                      controls
                      className='w-full h-8 rounded'
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className='text-xs text-gray-500 leading-relaxed'>
                No voice sample attached. Adding a reference audio file enables custom voice cloning and talking head narration aligned with this persona.
              </p>
            )}
          </div>

          <div className='mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500'>
            <span>TTS clone and narration reference</span>
            <Button
              asChild
              variant='tertiary-gray'
              size='sm'
              className='text-xs h-7 text-primary-600 hover:text-primary-700'
            >
              <Link to={`/dashboard/persona-form?personaId=${persona.id}`}>
                <PenIcon className='w-3 h-3 mr-1' />
                Configure Voice
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Dedicated Tabs Navigation Cards */}
      <div>
        <h3 className='text-base font-semibold text-gray-900 mb-3'>
          Pipeline Configuration Tabs
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {/* Card 1: Script Files */}
          <div className='bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:border-primary-300 transition-all flex flex-col justify-between group'>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <div className='w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center'>
                  <FileTextIcon className='w-5 h-5' />
                </div>
                <span className='text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700'>
                  2 Files
                </span>
              </div>
              <h4 className='text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors'>
                Script Files
              </h4>
              <p className='text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed'>
                Writing DNA and Script Generation Prompt templates.
              </p>
              <div className='mt-3 space-y-1 text-xs text-gray-600'>
                <div className='flex items-center justify-between'>
                  <span>Writing DNA:</span>
                  <span className={persona.writingDnaPath ? 'text-success-600 font-medium' : 'text-gray-400'}>
                    {persona.writingDnaPath ? 'Set' : 'Missing'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span>Script Prompt:</span>
                  <span className={persona.scriptPromptPath ? 'text-success-600 font-medium' : 'text-gray-400'}>
                    {persona.scriptPromptPath ? 'Set' : 'Missing'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type='button'
              onClick={() => onSwitchTab('script-files')}
              className='mt-4 w-full py-2 px-3 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center justify-center gap-1.5'
            >
              <span>View Script Files</span>
              <ArrowRightIcon className='w-3.5 h-3.5' />
            </button>
          </div>

          {/* Card 2: Visual Files */}
          <div className='bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:border-primary-300 transition-all flex flex-col justify-between group'>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <div className='w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center'>
                  <SparklesIcon className='w-5 h-5' />
                </div>
                <span className='text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700'>
                  3 Files
                </span>
              </div>
              <h4 className='text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors'>
                Visual Files
              </h4>
              <p className='text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed'>
                Visual DNA rules, Video Generation Prompts, and Head Picture.
              </p>
              <div className='mt-3 space-y-1 text-xs text-gray-600'>
                <div className='flex items-center justify-between'>
                  <span>Visual DNA:</span>
                  <span className={persona.visualDnaPath ? 'text-success-600 font-medium' : 'text-gray-400'}>
                    {persona.visualDnaPath ? 'Set' : 'Missing'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span>Video Prompt:</span>
                  <span className={persona.videoPromptPath ? 'text-success-600 font-medium' : 'text-gray-400'}>
                    {persona.videoPromptPath ? 'Set' : 'Missing'}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span>Head Picture:</span>
                  <span className={persona.headPicturePath ? 'text-success-600 font-medium' : 'text-gray-400'}>
                    {persona.headPicturePath ? 'Set' : 'Missing'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type='button'
              onClick={() => onSwitchTab('visual-files')}
              className='mt-4 w-full py-2 px-3 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center justify-center gap-1.5'
            >
              <span>View Visual Files</span>
              <ArrowRightIcon className='w-3.5 h-3.5' />
            </button>
          </div>

          {/* Card 3: Character Sheet */}
          <div className='bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:border-primary-300 transition-all flex flex-col justify-between group'>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <div className='w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center'>
                  <ImageIcon className='w-5 h-5' />
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${persona.characterSheetPath ? 'bg-success-50 text-success-700' : 'bg-gray-100 text-gray-500'}`}>
                  {persona.characterSheetPath ? 'Configured' : 'Missing'}
                </span>
              </div>
              <h4 className='text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors'>
                Character Sheet
              </h4>
              <p className='text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed'>
                Turnaround angles and model sheet for visual consistency.
              </p>
              <div className='mt-3 text-xs text-gray-600'>
                <span className='font-mono text-gray-500 truncate block'>
                  {persona.characterSheetPath ? getFileName(persona.characterSheetPath) : 'No image uploaded'}
                </span>
              </div>
            </div>

            <button
              type='button'
              onClick={() => onSwitchTab('character-sheet')}
              className='mt-4 w-full py-2 px-3 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center justify-center gap-1.5'
            >
              <span>View Character Sheet</span>
              <ArrowRightIcon className='w-3.5 h-3.5' />
            </button>
          </div>

          {/* Card 4: Script Judge */}
          <div className='bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:border-primary-300 transition-all flex flex-col justify-between group'>
            <div>
              <div className='flex items-center justify-between mb-2'>
                <div className='w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center'>
                  <AwardIcon className='w-5 h-5' />
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${persona.scriptJudgePath ? 'bg-success-50 text-success-700' : 'bg-gray-100 text-gray-500'}`}>
                  {persona.scriptJudgePath ? 'Configured' : 'Missing'}
                </span>
              </div>
              <h4 className='text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors'>
                Script Judge
              </h4>
              <p className='text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed'>
                Automated quality evaluator and retention grading rubric.
              </p>
              <div className='mt-3 text-xs text-gray-600'>
                <span className='font-mono text-gray-500 truncate block'>
                  {persona.scriptJudgePath ? getFileName(persona.scriptJudgePath) : 'No judge prompt set'}
                </span>
              </div>
            </div>

            <button
              type='button'
              onClick={() => onSwitchTab('script-judge')}
              className='mt-4 w-full py-2 px-3 text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center justify-center gap-1.5'
            >
              <span>View Script Judge</span>
              <ArrowRightIcon className='w-3.5 h-3.5' />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Launch Video Project Banner */}
      <div className='p-5 rounded-xl border border-primary-200 bg-gradient-to-r from-primary-600 to-purple-700 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm'>
        <div>
          <h4 className='text-base font-bold flex items-center gap-2'>
            <FilmIcon className='w-4 h-4' />
            Ready to generate video content?
          </h4>
          <p className='text-xs text-primary-100 mt-1 max-w-xl leading-relaxed'>
            Create a full AI video, audiobook, or talking head project pre-configured with this persona's voice, topics, and styles.
          </p>
        </div>

        <Button
          asChild
          size='sm'
          className='bg-white text-primary-700 hover:bg-primary-50 font-semibold text-xs shrink-0 shadow-sm'
        >
          <Link to={`/dashboard/project-form?personaId=${persona.id}`}>
            Create Video Project
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PersonaDetailsOverview;
