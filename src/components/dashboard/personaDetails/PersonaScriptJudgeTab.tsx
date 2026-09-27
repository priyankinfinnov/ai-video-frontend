import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AwardIcon,
  CopyIcon,
  CheckIcon,
  PenIcon,
  CheckCircle2Icon,
  FlameIcon,
  GaugeIcon,
  ClockIcon,
  AlertCircleIcon,
  SparklesIcon,
} from 'lucide-react';
import { Persona } from '@/types/persona';
import { Button } from '@/components/ui/button';
import {
  copyToClipboard,
  getFileName,
  getFileExtension,
} from './assetHelper';

interface PersonaScriptJudgeTabProps {
  persona: Persona;
}

export const PersonaScriptJudgeTab = ({ persona }: PersonaScriptJudgeTabProps) => {
  const [copied, setCopied] = useState(false);

  const isConfigured = !!persona.scriptJudgePath;
  const fileName = getFileName(persona.scriptJudgePath);
  const ext = getFileExtension(persona.scriptJudgePath);

  const handleCopy = () => {
    if (persona.scriptJudgePath) {
      copyToClipboard(persona.scriptJudgePath, 'Script Judge Path');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const rubricPillars = [
    {
      title: 'Hook Strength & Retention',
      icon: FlameIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      target: 'Score >= 8.5/10',
      desc: 'Checks if the opening 3-5 seconds pose a compelling question, highlight a paradox, or present high-stakes tension before the drop-off window.',
    },
    {
      title: 'Writing DNA Style Match',
      icon: SparklesIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      target: 'Match >= 90%',
      desc: `Verifies vocabulary, sentence rhythm, humor, and rhetorical tone strictly conform to ${persona.name}'s defined persona voice.`,
    },
    {
      title: 'Pacing & Timing Calibrator',
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      target: '140-160 WPM Target',
      desc: 'Calculates word count per scene part to ensure seamless narration timing and prevent listener fatigue.',
    },
    {
      title: 'Visual Cue Feasibility',
      icon: GaugeIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      target: '100% Validated',
      desc: 'Validates that every dialogue block is paired with clear, physically realistic visual generation prompts for the video renderer.',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Intro Header */}
      <div className='p-5 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2.5'>
            <div className='w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0'>
              <AwardIcon className='w-5 h-5' />
            </div>
            <div>
              <h2 className='text-lg font-bold text-gray-900'>
                Script Judge File
              </h2>
              <p className='text-xs text-gray-500'>
                Automated LLM quality evaluation prompt and retention criteria rubric
              </p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {isConfigured ? (
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
              {isConfigured ? 'Edit Judge Path' : 'Configure Judge'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left 2 Cols: Path Details & Judge Role */}
        <div className='lg:col-span-2 space-y-6'>
          {/* File Card */}
          <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4'>
            <div>
              <label className='text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5'>
                Configured File Path
              </label>
              {isConfigured ? (
                <div className='flex items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-gray-800'>
                  <div className='flex items-center gap-2 truncate'>
                    {ext && (
                      <span className='px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-800 shrink-0'>
                        .{ext}
                      </span>
                    )}
                    <span className='truncate' title={persona.scriptJudgePath!}>
                      {persona.scriptJudgePath}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={handleCopy}
                    className='text-gray-400 hover:text-primary-600 transition-colors p-1 shrink-0'
                    title='Copy path'
                  >
                    {copied ? (
                      <CheckIcon className='w-4 h-4 text-success-600' />
                    ) : (
                      <CopyIcon className='w-4 h-4' />
                    )}
                  </button>
                </div>
              ) : (
                <div className='flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-dashed border-gray-300 text-xs text-gray-400 italic'>
                  <AlertCircleIcon className='w-4 h-4 text-gray-400 shrink-0' />
                  <span>No Script Judge file configured for this persona. The system defaults to standard benchmark criteria.</span>
                </div>
              )}
            </div>

            <p className='text-xs text-gray-600 leading-relaxed'>
              The <strong className='text-gray-800'>Script Judge</strong> operates as an automated critic inside the video generation pipeline. After the initial script draft is created, the judge scores it across retention, voice, and flow. If thresholds aren't satisfied, it automatically feeds constructive revision directives back to the writer until approved.
            </p>
          </div>

          {/* Evaluation Pillars Grid */}
          <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4'>
            <h3 className='text-sm font-bold text-gray-900'>
              Evaluation Criteria & Rubric Pillars
            </h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
              {rubricPillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={idx}
                    className='p-3.5 rounded-lg border border-gray-100 bg-gray-50/50 space-y-1.5'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className={`p-1.5 rounded-md ${pillar.bgColor} ${pillar.color}`}>
                          <Icon className='w-4 h-4' />
                        </div>
                        <span className='text-xs font-bold text-gray-800'>
                          {pillar.title}
                        </span>
                      </div>
                      <span className='text-[10px] font-semibold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200'>
                        {pillar.target}
                      </span>
                    </div>
                    <p className='text-[11px] text-gray-500 leading-relaxed'>
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prompt Inspector Box */}
          <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-2'>
            <div className='flex items-center justify-between text-xs text-gray-500 font-mono'>
              <span className='font-semibold text-gray-700 font-sans'>
                Judge Evaluation Prompt Architecture
              </span>
              <span>{fileName || 'script_judge.prompt'}</span>
            </div>

            <pre className='p-3.5 bg-gray-900 text-gray-200 text-[11px] font-mono rounded-lg overflow-x-auto leading-relaxed border border-gray-800 max-h-48'>
{`SYSTEM PROMPT: SCRIPT QUALITY JUDGE
Persona: "${persona.name}"
Inputs:
  - Generated Script Draft (JSON multi-part)
  - Persona Writing DNA & Topics
Tasks:
  1. Grade Hook Strength (1-10)
  2. Grade Persona Voice Alignment (1-10)
  3. Validate Narrative Progression (1-10)
Output Response (JSON):
{
  "approved": boolean,
  "overallScore": number (0-100),
  "feedback": string,
  "requiredChanges": string[]
}`}
            </pre>
          </div>
        </div>

        {/* Right Col: Benefits & Pipeline Role */}
        <div className='space-y-6'>
          <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4'>
            <div className='flex items-center gap-2 text-amber-700 font-bold text-sm'>
              <CheckCircle2Icon className='w-4 h-4 text-success-600' />
              <h3>Why Quality Judging Matters</h3>
            </div>

            <ul className='space-y-3 text-xs text-gray-600'>
              <li className='flex items-start gap-2'>
                <span className='w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0' />
                <span>
                  <strong>Zero Low-Quality Renders:</strong> Pre-evaluates scripts before costly diffusion video generation begins.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0' />
                <span>
                  <strong>Iterative Self-Correction:</strong> Uses structured feedback loops to rewrite deficient parts automatically.
                </span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0' />
                <span>
                  <strong>Audience Retention:</strong> Keeps viewer drop-off under control by enforcing suspense hooks at each part transition.
                </span>
              </li>
            </ul>

            <div className='pt-3 border-t border-gray-100'>
              <Button
                asChild
                variant='secondary-gray'
                size='sm'
                className='w-full text-xs'
              >
                <Link to={`/dashboard/persona-form?personaId=${persona.id}`}>
                  <PenIcon className='w-3 h-3 mr-1.5' />
                  {isConfigured ? 'Update Judge File' : 'Assign Judge File'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaScriptJudgeTab;
