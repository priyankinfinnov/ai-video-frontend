import { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Youtube,
  Instagram,
  Film,
  Scissors,
  Clock,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import {
  Automation,
  AutomationPlatform,
  AutomationTarget,
  AutomationUploadType,
  AutomationFrequency,
  CreateAutomationRequest,
  UpdateAutomationRequest,
} from '@/types/automation';
import { Persona } from '@/types/persona';
import { useGetPersonasQuery } from '@/queries/personaQueries';
import {
  useCreateAutomationMutation,
  useUpdateAutomationMutation,
} from '@/queries/automationActions';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  automation?: Automation | null; // If provided, we are editing
  cloneFrom?: Automation | null; // If provided, we are cloning
  fixedPersonaId?: number; // If opened from persona details tab
}

export const AutomationModal = ({
  isOpen,
  onClose,
  automation,
  cloneFrom,
  fixedPersonaId,
}: AutomationModalProps) => {
  const token = useAppSelector((store) => store.auth.token);

  // Fetch personas for dropdown
  const { data: personasResponse } = useGetPersonasQuery({
    token,
    page: 1,
    limit: 100,
  });
  const personas = personasResponse?.data || [];

  // Form State
  const [name, setName] = useState<string>(
    automation?.name || (cloneFrom?.name ? `${cloneFrom.name} (Copy)` : '')
  );
  const [personaId, setPersonaId] = useState<number>(
    automation?.personaId || cloneFrom?.personaId || fixedPersonaId || 0
  );
  const [platform, setPlatform] = useState<AutomationPlatform>(
    automation?.platform || cloneFrom?.platform || 'YOUTUBE'
  );
  const [target, setTarget] = useState<AutomationTarget>(
    automation?.target || cloneFrom?.target || 'PROJECT'
  );
  const [uploadType, setUploadType] = useState<AutomationUploadType>(
    automation?.uploadType || cloneFrom?.uploadType || 'DRAFT'
  );
  const [frequency, setFrequency] = useState<AutomationFrequency>(
    automation?.frequency || cloneFrom?.frequency || 'DAILY'
  );
  const [postsPerPeriod, setPostsPerPeriod] = useState<number>(
    automation?.postsPerPeriod ?? cloneFrom?.postsPerPeriod ?? 1
  );
  const [timeRangeStart, setTimeRangeStart] = useState<string>(
    automation?.timeRangeStart || cloneFrom?.timeRangeStart || '14:00'
  );
  const [timeRangeEnd, setTimeRangeEnd] = useState<string>(
    automation?.timeRangeEnd || cloneFrom?.timeRangeEnd || '18:00'
  );
  const [cooldownHours, setCooldownHours] = useState<number>(
    automation?.cooldownHours ?? cloneFrom?.cooldownHours ?? 24
  );
  const [isEnabled, setIsEnabled] = useState<boolean>(
    automation?.isEnabled ?? cloneFrom?.isEnabled ?? true
  );
  const [errorMsg, setErrorMsg] = useState<string>('');

  const { mutateAsync: createAutomation, isLoading: isCreating } =
    useCreateAutomationMutation(token);
  const { mutateAsync: updateAutomation, isLoading: isUpdating } =
    useUpdateAutomationMutation(automation?.id, token);

  const isSubmitting = isCreating || isUpdating;

  // Initialize or reset form when modal opens or automation changes
  useEffect(() => {
    if (isOpen) {
      if (automation) {
        setName(automation.name || '');
        setPersonaId(automation.personaId);
        setPlatform(automation.platform);
        setTarget(automation.target);
        setUploadType(automation.uploadType);
        setFrequency(automation.frequency);
        setPostsPerPeriod(automation.postsPerPeriod ?? 1);
        setTimeRangeStart(automation.timeRangeStart || '14:00');
        setTimeRangeEnd(automation.timeRangeEnd || '18:00');
        setCooldownHours(automation.cooldownHours ?? 24);
        setIsEnabled(automation.isEnabled ?? true);
      } else if (cloneFrom) {
        setName(cloneFrom.name ? `${cloneFrom.name} (Copy)` : '');
        setPersonaId(cloneFrom.personaId);
        setPlatform(cloneFrom.platform);
        setTarget(cloneFrom.target);
        setUploadType(cloneFrom.uploadType);
        setFrequency(cloneFrom.frequency);
        setPostsPerPeriod(cloneFrom.postsPerPeriod ?? 1);
        setTimeRangeStart(cloneFrom.timeRangeStart || '14:00');
        setTimeRangeEnd(cloneFrom.timeRangeEnd || '18:00');
        setCooldownHours(cloneFrom.cooldownHours ?? 24);
        setIsEnabled(cloneFrom.isEnabled ?? true);
      } else {
        const defaultPersona = fixedPersonaId || (personas.length > 0 ? personas[0].id : 0);
        setName('');
        setPersonaId(defaultPersona);
        setPlatform('YOUTUBE');
        setTarget('PROJECT');
        setUploadType('DRAFT');
        setFrequency('DAILY');
        setPostsPerPeriod(1);
        setTimeRangeStart('14:00');
        setTimeRangeEnd('18:00');
        setCooldownHours(24);
        setIsEnabled(true);
      }
      setErrorMsg('');
    }
  }, [isOpen, automation, cloneFrom, fixedPersonaId, personas]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!personaId) {
      setErrorMsg('Please select a persona.');
      return;
    }

    if (!timeRangeStart || !timeRangeEnd) {
      setErrorMsg('Please provide both start and end times for the publishing window.');
      return;
    }

    if (cooldownHours < 1) {
      setErrorMsg('Cooldown hours must be at least 1 hour.');
      return;
    }

    if (postsPerPeriod < 1) {
      setErrorMsg('Posts per period must be at least 1.');
      return;
    }

    // Instagram does not support PROJECT (long-form video) as draft
    if (platform === 'INSTAGRAM' && target === 'PROJECT') {
      setErrorMsg('Instagram publishing only supports 9:16 Shorts Clips (Reels).');
      return;
    }

    try {
      if (automation) {
        const updatePayload: UpdateAutomationRequest = {
          name: name.trim() || undefined,
          personaId,
          platform,
          target,
          uploadType,
          frequency,
          postsPerPeriod: Number(postsPerPeriod),
          timeRangeStart,
          timeRangeEnd,
          cooldownHours: Number(cooldownHours),
          isEnabled,
        };
        await updateAutomation(updatePayload);
      } else {
        const createPayload: CreateAutomationRequest = {
          name: name.trim() || undefined,
          personaId,
          platform,
          target,
          uploadType,
          frequency,
          postsPerPeriod: Number(postsPerPeriod),
          timeRangeStart,
          timeRangeEnd,
          cooldownHours: Number(cooldownHours),
          isEnabled,
        };
        await createAutomation(createPayload);
      }
      onClose();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'An error occurred while saving the automation.');
    }
  };

  return (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className='px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100'>
              <Zap className='w-5 h-5' />
            </div>
            <div>
              <h2 className='text-base font-semibold text-gray-900'>
                {cloneFrom
                  ? 'Clone Publishing Automation'
                  : automation
                  ? 'Edit Publishing Automation'
                  : 'Create Publishing Automation'}
              </h2>
              <p className='text-xs text-gray-500'>
                Configure scheduled automatic uploads with randomized posting windows
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className='p-6 space-y-5 max-h-[75vh] overflow-y-auto'>
          {errorMsg && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2'>
              <ShieldAlert className='w-4 h-4 shrink-0 text-red-600' />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Automation Name Field */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold text-gray-700'>
              Automation Name <span className='text-gray-400 font-normal'>(optional)</span>
            </Label>
            <Input
              type='text'
              placeholder='e.g. US EST Morning Shorts Automation'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='text-xs h-9 bg-white'
              data-testid='automation-name-input'
            />
            <p className='text-[11px] text-gray-500'>
              Friendly name to identify this automation rule in lists and logs.
            </p>
          </div>

          {/* Persona Selection */}
          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold text-gray-700'>
              Target Persona <span className='text-red-500'>*</span>
            </Label>
            <select
              value={personaId}
              onChange={(e) => setPersonaId(Number(e.target.value))}
              disabled={!!fixedPersonaId}
              className='w-full text-xs rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-2xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500'
            >
              {personas.length === 0 ? (
                <option value={0}>No personas available</option>
              ) : (
                personas.map((p: Persona) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Persona #{p.id})
                  </option>
                ))
              )}
            </select>
            <p className='text-[11px] text-gray-500'>
              Automations run against content generated under this persona.
            </p>
          </div>

          {/* Platform & Target Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Platform Selector */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-700'>Platform</Label>
              <div className='grid grid-cols-2 gap-2'>
                <button
                  type='button'
                  onClick={() => {
                    setPlatform('YOUTUBE');
                  }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    platform === 'YOUTUBE'
                      ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                  }`}
                >
                  <Youtube className='w-4 h-4 text-red-600' />
                  YouTube
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setPlatform('INSTAGRAM');
                    // Instagram only supports SHORTS_CLIP
                    setTarget('SHORTS_CLIP');
                    setUploadType('ACTUAL_POST');
                  }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    platform === 'INSTAGRAM'
                      ? 'border-pink-500 bg-pink-50 text-pink-700 ring-1 ring-pink-500'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                  }`}
                >
                  <Instagram className='w-4 h-4 text-pink-600' />
                  Instagram
                </button>
              </div>
            </div>

            {/* Target Content */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-700'>Target Content</Label>
              <div className='grid grid-cols-2 gap-2'>
                <button
                  type='button'
                  disabled={platform === 'INSTAGRAM'}
                  onClick={() => setTarget('PROJECT')}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    target === 'PROJECT'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                  } ${platform === 'INSTAGRAM' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Film className='w-4 h-4 text-primary-600' />
                  Master Video
                </button>
                <button
                  type='button'
                  onClick={() => setTarget('SHORTS_CLIP')}
                  className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                    target === 'SHORTS_CLIP'
                      ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                  }`}
                >
                  <Scissors className='w-4 h-4 text-primary-600' />
                  Shorts Clip
                </button>
              </div>
            </div>
          </div>

          {/* Upload Mode, Cadence & Posts Per Period */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Upload Type */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-700'>Upload Mode</Label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as AutomationUploadType)}
                className='w-full text-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-2xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
              >
                <option value='DRAFT'>DRAFT (Private review in Studio)</option>
                <option value='ACTUAL_POST'>ACTUAL_POST (Direct public posting)</option>
              </select>
              <p className='text-[11px] text-gray-500'>
                {uploadType === 'DRAFT'
                  ? 'Uploaded privately to YouTube Studio so you can verify tags and preview before releasing.'
                  : 'Posts directly to public YouTube / Instagram Reels feeds.'}
              </p>
            </div>

            {/* Frequency */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-700'>Cadence / Frequency</Label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as AutomationFrequency)}
                className='w-full text-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-2xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'
              >
                <option value='DAILY'>Daily Window (Recommended)</option>
                <option value='MULTIPLE_TIMES_DAILY'>Multiple Times Daily</option>
                <option value='WEEKLY'>Weekly Release</option>
                <option value='MULTIPLE_TIMES_WEEKLY'>Multiple Times Weekly</option>
                <option value='EVERY_X_HOURS'>Every X Hours</option>
                <option value='IMMEDIATE'>Immediate Post (When Ready)</option>
                <option value='HOURLY'>Hourly Check</option>
              </select>
              <p className='text-[11px] text-gray-500'>
                Posting cycles check eligible completed projects or clips.
              </p>
            </div>
          </div>

          {/* Posts Per Period Input & Cooldown Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-start'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-700'>
                Max Posts Per Period
              </Label>
              <Input
                type='number'
                min={1}
                max={100}
                value={postsPerPeriod}
                onChange={(e) => setPostsPerPeriod(Math.max(1, Number(e.target.value)))}
                className='text-xs h-9'
                required
                data-testid='posts-per-period-input'
              />
              <p className='text-[11px] text-gray-500'>
                Maximum number of automated posts created in each frequency cycle.
              </p>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-700'>
                Cooldown Period (Hours)
              </Label>
              <Input
                type='number'
                min={1}
                max={720}
                value={cooldownHours}
                onChange={(e) => setCooldownHours(Number(e.target.value))}
                className='text-xs h-9'
                required
              />
              <p className='text-[11px] text-gray-500'>
                Minimum elapsed hours required between consecutive uploads.
              </p>
            </div>
          </div>

          {/* Time Window (Start & End) */}
          <div className='space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200'>
            <div className='flex items-center gap-2 text-xs font-semibold text-gray-900'>
              <Clock className='w-4 h-4 text-primary-600' />
              Randomized Posting Window (24h format)
            </div>
            <p className='text-[11px] text-gray-500 leading-relaxed'>
              To simulate natural creator behavior, the system randomly selects a post timestamp inside this window for each cycle.
            </p>

            <div className='grid grid-cols-2 gap-3 pt-1'>
              <div className='space-y-1'>
                <Label className='text-[11px] text-gray-600'>Start Time (HH:mm)</Label>
                <Input
                  type='time'
                  value={timeRangeStart}
                  onChange={(e) => setTimeRangeStart(e.target.value)}
                  className='text-xs h-9 bg-white'
                  required
                />
              </div>

              <div className='space-y-1'>
                <Label className='text-[11px] text-gray-600'>End Time (HH:mm)</Label>
                <Input
                  type='time'
                  value={timeRangeEnd}
                  onChange={(e) => setTimeRangeEnd(e.target.value)}
                  className='text-xs h-9 bg-white'
                  required
                />
              </div>
            </div>
          </div>

          {/* Active Status Switch */}
          <div className='pt-1'>
            <div className='flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200'>
              <div>
                <div className='text-xs font-semibold text-gray-900'>Active Status</div>
                <div className='text-[11px] text-gray-500'>
                  {isEnabled ? 'Automation is active' : 'Automation is paused'}
                </div>
              </div>

              <label className='relative inline-flex items-center cursor-pointer'>
                <input
                  type='checkbox'
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className='pt-3 border-t border-gray-100 flex items-center justify-end gap-3'>
            <Button
              type='button'
              variant='secondary-gray'
              size='sm'
              disabled={isSubmitting}
              onClick={onClose}
              className='text-xs'
            >
              Cancel
            </Button>

            <Button
              type='submit'
              size='sm'
              disabled={isSubmitting}
              className='bg-primary-600 hover:bg-primary-700 text-white text-xs flex items-center gap-1.5 shadow-xs'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                  Saving...
                </>
              ) : automation ? (
                'Save Changes'
              ) : (
                'Create Automation'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutomationModal;
