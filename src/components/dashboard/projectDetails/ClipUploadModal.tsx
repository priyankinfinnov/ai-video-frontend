import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Youtube,
  Instagram,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  ExternalLink,
  Tag,
  FileText,
  Share2,
} from 'lucide-react';
import { ShortsClip, UploadShortsClipRequest } from '@/types/project';
import { useUploadShortsClipMutation, parseUploadError, UploadErrorInfo } from '@/queries/projectActions';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ClipUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: ShortsClip | null;
  personaId?: number;
  initialPlatform?: 'YOUTUBE' | 'INSTAGRAM';
}

export const ClipUploadModal: React.FC<ClipUploadModalProps> = ({
  isOpen,
  onClose,
  clip,
  personaId,
  initialPlatform = 'YOUTUBE',
}) => {
  const token = useAppSelector((store) => store.auth.token);
  const { mutateAsync: uploadClip, isLoading } = useUploadShortsClipMutation(token);

  const [platform, setPlatform] = useState<'YOUTUBE' | 'INSTAGRAM'>(initialPlatform);
  const [uploadType, setUploadType] = useState<'DRAFT' | 'ACTUAL_POST'>('ACTUAL_POST');
  const [customTitle, setCustomTitle] = useState('');
  const [customCaption, setCustomCaption] = useState('');
  const [customTags, setCustomTags] = useState('');
  const [errorInfo, setErrorInfo] = useState<UploadErrorInfo | null>(null);

  useEffect(() => {
    if (clip) {
      setPlatform(initialPlatform);
      setCustomTitle(clip.title || '');
      // Generate initial caption with virality hook and hashtags
      const tags = 'shorts, viral, reels, ai';
      setCustomTags(tags);
      setCustomCaption(
        clip.shortsTranscript
          ? `${clip.shortsTranscript.slice(0, 140)}... #shorts #viral`
          : clip.viralityReason || ''
      );
      setUploadType('ACTUAL_POST');
      setErrorInfo(null);
    }
  }, [clip, isOpen, initialPlatform]);

  if (!isOpen || !clip) return null;

  const isCompleted = clip.status === 'COMPLETED';
  const isYoutubeUploading = clip.youtubeStatus === 'UPLOADING' || clip.youtubeStatus === 'QUEUED';
  const isInstagramUploading = clip.instagramStatus === 'UPLOADING' || clip.instagramStatus === 'QUEUED';
  const isSelectedUploading =
    platform === 'YOUTUBE' ? isYoutubeUploading : isInstagramUploading;

  const isYoutubePublished = clip.youtubeStatus === 'PUBLISHED';
  const isInstagramPublished = clip.instagramStatus === 'PUBLISHED';
  const isSelectedPublished =
    platform === 'YOUTUBE' ? isYoutubePublished : isInstagramPublished;

  const isYoutubeDraft = clip.youtubeStatus === 'DRAFT' || clip.youtubeStatus === 'DRAFT_UPLOADED';

  const canUpload = isCompleted && !isSelectedUploading && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpload) return;

    setErrorInfo(null);
    const tagsArray = customTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: UploadShortsClipRequest = {
      platform,
      uploadType,
      customTitle: customTitle.trim() || undefined,
      customCaption: customCaption.trim() || undefined,
      customTags: tagsArray.length > 0 ? tagsArray : undefined,
    };

    try {
      await uploadClip({ id: clip.id, payload });
      onClose();
    } catch (err: unknown) {
      const parsed = parseUploadError(err, 'clip');
      setErrorInfo(parsed);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150'
      onClick={onClose}
    >
      <div
        className='relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200'
        onClick={(e) => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby='upload-clip-modal-title'
      >
        {/* Header Banner */}
        <div className='p-5 border-b border-gray-100 flex items-start justify-between gap-3 bg-gradient-to-r from-purple-50/70 via-pink-50/30 to-white'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-xs'>
              <Share2 className='w-5 h-5' />
            </div>
            <div>
              <h3 id='upload-clip-modal-title' className='text-base font-bold text-gray-900 leading-snug'>
                Direct Shorts Upload & Publishing
              </h3>
              <p className='text-xs text-gray-500 mt-0.5'>
                Instant publish for 9:16 Vertical Clip #{clip.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type='button'
            className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
            title='Close modal'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-5 space-y-4 max-h-[75vh] overflow-y-auto'>
          {/* Eligibility & Status Alerts */}
          {!isCompleted ? (
            <div className='p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs'>
              <AlertCircle className='w-4 h-4 text-amber-600 shrink-0 mt-0.5' />
              <div>
                <p className='font-semibold'>Clip Not Completed</p>
                <p className='mt-0.5 text-amber-800'>
                  This clip status is currently <span className='font-mono font-semibold'>{clip.status}</span>.
                  Direct upload requires the clip rendering to be in <span className='font-semibold'>COMPLETED</span> status.
                </p>
              </div>
            </div>
          ) : isSelectedUploading ? (
            <div className='p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-2.5 text-xs'>
              <Loader2 className='w-4 h-4 text-blue-600 animate-spin shrink-0' />
              <div>
                <p className='font-semibold'>Upload In Progress</p>
                <p className='mt-0.5 text-blue-800'>
                  This clip is currently being uploaded to {platform === 'YOUTUBE' ? 'YouTube' : 'Instagram'}. Please wait for completion.
                </p>
              </div>
            </div>
          ) : isSelectedPublished ? (
            <div className='p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-2 text-xs'>
              <div className='flex items-center gap-2'>
                <CheckCircle2 className='w-4 h-4 text-emerald-600 shrink-0' />
                <span>Clip already published on {platform === 'YOUTUBE' ? 'YouTube Shorts' : 'Instagram Reels'}.</span>
              </div>
              {platform === 'YOUTUBE' && clip.youtubeUrl && (
                <a
                  href={clip.youtubeUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 underline'
                >
                  View
                  <ExternalLink className='w-3 h-3' />
                </a>
              )}
              {platform === 'INSTAGRAM' && clip.instagramUrl && (
                <a
                  href={clip.instagramUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 underline'
                >
                  View
                  <ExternalLink className='w-3 h-3' />
                </a>
              )}
            </div>
          ) : platform === 'YOUTUBE' && isYoutubeDraft ? (
            <div className='p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between gap-2 text-xs'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 rounded-full bg-blue-500' />
                <span>Clip is saved as a <strong>YouTube Studio Draft</strong>.</span>
              </div>
              {clip.youtubeUrl && (
                <a
                  href={clip.youtubeUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800 underline'
                >
                  View
                  <ExternalLink className='w-3 h-3' />
                </a>
              )}
            </div>
          ) : null}

          {/* Backend Error / Missing Account Prompt */}
          {errorInfo && (
            <div className='p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-2 text-xs animate-in fade-in duration-200'>
              <div className='flex items-start gap-2'>
                <AlertCircle className='w-4 h-4 text-red-600 shrink-0 mt-0.5' />
                <div className='space-y-1'>
                  <p className='font-semibold text-red-800'>
                    {errorInfo.isAccountNotLinked
                      ? `${platform === 'YOUTUBE' ? 'YouTube' : 'Instagram'} Account Not Connected`
                      : errorInfo.isAlreadyUploading
                      ? 'Upload Conflict (409)'
                      : errorInfo.isNotFound
                      ? 'Clip Not Found (404)'
                      : 'Upload Failed'}
                  </p>
                  <p className='text-red-700 leading-relaxed'>{errorInfo.message}</p>
                </div>
              </div>

              {errorInfo.isAccountNotLinked && (
                <div className='pt-2 border-t border-red-200/80 flex items-center justify-between'>
                  <span className='text-[11px] text-red-600'>
                    Connect your {platform === 'YOUTUBE' ? 'YouTube channel' : 'Instagram account'} in Persona Settings.
                  </span>
                  {personaId ? (
                    <Link
                      to={`/dashboard/personas/${personaId}?tab=integrations`}
                      target='_blank'
                      className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-xs transition-colors'
                    >
                      Open Social Settings
                      <ExternalLink className='w-3 h-3' />
                    </Link>
                  ) : (
                    <Link
                      to='/dashboard/personas'
                      target='_blank'
                      className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-xs transition-colors'
                    >
                      Persona Settings
                      <ExternalLink className='w-3 h-3' />
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Platform Selector */}
          <div className='space-y-2'>
            <Label className='text-xs font-semibold text-gray-700'>
              Select Destination Platform
            </Label>
            <div className='grid grid-cols-2 gap-2.5'>
              <button
                type='button'
                onClick={() => setPlatform('YOUTUBE')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  platform === 'YOUTUBE'
                    ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <Youtube className='w-4 h-4 text-red-600' />
                  <span className='text-xs font-bold text-gray-900'>YouTube Shorts</span>
                </div>
                <div className='mt-2 text-[10px] text-gray-500 flex items-center justify-between'>
                  <span>Status:</span>
                  <span className='font-semibold text-gray-700'>
                    {isYoutubeUploading ? 'Uploading...' : clip.youtubeStatus || 'Not Uploaded'}
                  </span>
                </div>
              </button>

              <button
                type='button'
                onClick={() => setPlatform('INSTAGRAM')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  platform === 'INSTAGRAM'
                    ? 'border-pink-500 bg-pink-50/50 ring-1 ring-pink-500 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className='flex items-center gap-2'>
                  <Instagram className='w-4 h-4 text-pink-600' />
                  <span className='text-xs font-bold text-gray-900'>Instagram Reels</span>
                </div>
                <div className='mt-2 text-[10px] text-gray-500 flex items-center justify-between'>
                  <span>Status:</span>
                  <span className='font-semibold text-gray-700'>
                    {isInstagramUploading ? 'Uploading...' : clip.instagramStatus || 'Not Uploaded'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Upload Mode for YouTube */}
          {platform === 'YOUTUBE' && (
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold text-gray-700'>
                Publishing Mode
              </Label>
              <div className='grid grid-cols-2 gap-2'>
                <button
                  type='button'
                  onClick={() => setUploadType('ACTUAL_POST')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    uploadType === 'ACTUAL_POST'
                      ? 'border-red-500 bg-red-50/60 font-semibold text-red-900'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  Live Short (Public)
                </button>
                <button
                  type='button'
                  onClick={() => setUploadType('DRAFT')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    uploadType === 'DRAFT'
                      ? 'border-primary-500 bg-primary-50/60 font-semibold text-primary-900'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                >
                  Studio Draft
                </button>
              </div>
            </div>
          )}

          {/* Custom Title */}
          <div className='space-y-1.5'>
            <Label htmlFor='clip-custom-title' className='text-xs font-semibold text-gray-700 flex items-center gap-1'>
              <FileText className='w-3.5 h-3.5 text-gray-400' />
              Hook Title
            </Label>
            <Input
              id='clip-custom-title'
              type='text'
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder='e.g. Viral Hook #Shorts'
              maxLength={100}
              className='text-xs'
            />
          </div>

          {/* Caption / Description (especially for Instagram) */}
          <div className='space-y-1.5'>
            <Label htmlFor='clip-custom-caption' className='text-xs font-semibold text-gray-700 flex items-center gap-1'>
              <span>Caption / Video Description</span>
              {platform === 'INSTAGRAM' && (
                <span className='text-[10px] text-pink-600 font-normal'>
                  (Recommended for Reels)
                </span>
              )}
            </Label>
            <Textarea
              id='clip-custom-caption'
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              placeholder='Check this out! #Viral #Reels'
              rows={2}
              className='text-xs'
            />
          </div>

          {/* Tags */}
          <div className='space-y-1.5'>
            <Label htmlFor='clip-custom-tags' className='text-xs font-semibold text-gray-700 flex items-center gap-1'>
              <Tag className='w-3.5 h-3.5 text-gray-400' />
              Hashtags / Tags (Comma Separated)
            </Label>
            <Input
              id='clip-custom-tags'
              type='text'
              value={customTags}
              onChange={(e) => setCustomTags(e.target.value)}
              placeholder='shorts, viral, reel'
              className='text-xs'
            />
          </div>

          {/* Footer Actions */}
          <div className='pt-3 border-t border-gray-100 flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='secondary-gray'
              size='sm'
              onClick={onClose}
              disabled={isLoading}
              className='text-xs'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              size='sm'
              disabled={!canUpload}
              className={`text-white text-xs flex items-center gap-1.5 shadow-sm min-w-[140px] justify-center ${
                platform === 'YOUTUBE'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                  <span>Uploading...</span>
                </>
              ) : platform === 'YOUTUBE' ? (
                <>
                  <Youtube className='w-3.5 h-3.5 fill-current' />
                  <span>Upload to YouTube</span>
                </>
              ) : (
                <>
                  <Instagram className='w-3.5 h-3.5' />
                  <span>Post to Instagram</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClipUploadModal;
