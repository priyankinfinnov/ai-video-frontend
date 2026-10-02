import React, { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  Clock,
  Cpu,
  Youtube,
  Instagram,
  AlertCircle,
  FileText,
  Share2,
  Loader2,
} from 'lucide-react';
import { ShortsClip, ShortsClipStatus } from '@/types/project';
import { getCreatedDate } from '@/utils/utils';
import { resolveAssetUrl } from '@/components/dashboard/personaDetails/assetHelper';

interface ShortClipCardProps {
  clip: ShortsClip;
  onInspect: (clip: ShortsClip) => void;
  isPlaying: boolean;
  onTogglePlay: (clipId: number) => void;
  onUpload?: (clip: ShortsClip, platform?: 'YOUTUBE' | 'INSTAGRAM') => void;
}

const getClipBadge = (status: ShortsClipStatus | string) => {
  const upper = (status || '').toUpperCase();
  if (upper === 'COMPLETED') {
    return (
      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/90 text-white backdrop-blur-xs shadow-xs'>
        Completed
      </span>
    );
  }
  if (upper === 'FAILED') {
    return (
      <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-600/90 text-white backdrop-blur-xs'>
        Failed
      </span>
    );
  }
  if (upper === 'BURNING_SUBTITLES_IN_PROGRESS') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-600/90 text-white backdrop-blur-xs animate-pulse'>
        <span className='w-1.5 h-1.5 rounded-full bg-white' />
        Burning Subtitles
      </span>
    );
  }
  if (upper === 'CARVING_IN_PROGRESS') {
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600/90 text-white backdrop-blur-xs animate-pulse'>
        <span className='w-1.5 h-1.5 rounded-full bg-white' />
        Carving
      </span>
    );
  }
  return (
    <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/90 text-white backdrop-blur-xs'>
      Pending
    </span>
  );
};

export const ShortClipCard: React.FC<ShortClipCardProps> = ({
  clip,
  onInspect,
  isPlaying,
  onTogglePlay,
  onUpload,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);

  const videoPath = clip.videoPath || clip.rawVideoPath;
  const normalizedPath = videoPath ? videoPath.replace(/\\/g, '/') : '';
  const cleanPath = normalizedPath.includes('storage/')
    ? normalizedPath.substring(normalizedPath.indexOf('storage/'))
    : normalizedPath;
  const videoUrl = resolveAssetUrl(cleanPath);

  // Sync playback when isPlaying prop changes
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay with sound blocked by browser, attempting muted playback:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch((playErr) => {
              console.error('Playback failed:', playErr);
              setVideoError(true);
            });
          }
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || clip.duration || 1;
    setProgress((current / dur) * 100);
  };

  const handleVideoEnded = () => {
    setProgress(0);
    onTogglePlay(clip.id);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoUrl) return;
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    toast.success(`Copied URL for Clip #${clip.id}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardPlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoUrl) {
      toast.error('Video file is still processing or unavailable');
      return;
    }
    setVideoError(false);
    onTogglePlay(clip.id);
  };

  return (
    <div
      className='bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-xl hover:border-primary-400 transition-all duration-300 flex flex-col group relative overflow-hidden'
      data-testid={`short-clip-card-${clip.id}`}
    >
      {/* 9:16 Vertical Video Preview & Playback Area */}
      <div className='relative aspect-[9/16] w-full bg-gray-950 overflow-hidden select-none'>
        {videoUrl && !videoError ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              preload='auto'
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onError={() => {
                console.error(`Failed to load video: ${videoUrl}`);
                setVideoError(true);
              }}
              onClick={handleCardPlayToggle}
              className='w-full h-full object-cover cursor-pointer'
            />

            {/* Subtle Gradient Vignette */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none' />

            {/* Center Play Button Overlay (when paused) */}
            {!isPlaying && (
              <div
                className='absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/15 hover:bg-black/30 transition-colors'
                onClick={handleCardPlayToggle}
              >
                <button
                  type='button'
                  onClick={handleCardPlayToggle}
                  className='w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/40 backdrop-blur-xs cursor-pointer'
                  title='Play Clip'
                >
                  <Play className='w-6 h-6 ml-0.5 fill-current' />
                </button>
              </div>
            )}

            {/* In-Video Controls when playing */}
            {isPlaying && (
              <>
                {/* Playing Header Controls (Mute & Expand) */}
                <div className='absolute top-3 right-3 z-30 flex items-center gap-1.5'>
                  <button
                    type='button'
                    onClick={toggleMute}
                    className='p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-xs border border-white/20 transition-colors'
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className='w-3.5 h-3.5' /> : <Volume2 className='w-3.5 h-3.5' />}
                  </button>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspect(clip);
                    }}
                    className='p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-xs border border-white/20 transition-colors'
                    title='Inspect Clip in Fullscreen Modal'
                  >
                    <Maximize2 className='w-3.5 h-3.5' />
                  </button>
                </div>

                {/* Bottom Scrubbing Bar */}
                <div
                  className='absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-30 cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!videoRef.current) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = clickX / rect.width;
                    const dur = videoRef.current.duration || clip.duration || 1;
                    videoRef.current.currentTime = pct * dur;
                  }}
                >
                  <div
                    className='h-full bg-primary-500 transition-all duration-100'
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Floating Pause Overlay Indicator on hover while playing */}
                <div
                  className='absolute inset-0 z-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 cursor-pointer'
                  onClick={handleCardPlayToggle}
                >
                  <div className='w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-lg'>
                    <Pause className='w-5 h-5 fill-current' />
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className='absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-gray-400 space-y-2 bg-gray-900'>
            <AlertCircle className='w-8 h-8 text-amber-500' />
            <p className='text-xs font-medium text-gray-300'>
              {clip.status === 'FAILED'
                ? 'Clip Rendering Failed'
                : videoError
                ? 'Clip Video Loading Failed'
                : 'Clip Processing...'}
            </p>
            {videoError && (
              <button
                type='button'
                onClick={() => {
                  setVideoError(false);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className='text-[11px] text-primary-400 hover:underline'
              >
                Retry loading
              </button>
            )}
          </div>
        )}

        {/* Top-Left: Clip ID Badge (visible when not playing) */}
        {!isPlaying && (
          <div className='absolute top-3 left-3 z-10'>
            <span className='inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-black/70 text-white backdrop-blur-xs border border-white/10 shadow-xs'>
              #{clip.id}
            </span>
          </div>
        )}

        {/* Top-Right: Status Badge (visible when not playing) */}
        {!isPlaying && (
          <div className='absolute top-3 right-3 z-10 flex items-center gap-1.5'>
            {getClipBadge(clip.status)}
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                onInspect(clip);
              }}
              className='p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity'
              title='Inspect Clip in Fullscreen Modal'
            >
              <Maximize2 className='w-3.5 h-3.5' />
            </button>
          </div>
        )}

        {/* Bottom Floating Info Over Video (visible when not playing) */}
        {!isPlaying && (
          <div className='absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-end justify-between pointer-events-none'>
            {/* Social Publication Indicators */}
            <div className='flex items-center gap-1 pointer-events-auto'>
              {(clip.youtubeStatus === 'PUBLISHED' || clip.youtubeStatus === 'DRAFT' || clip.youtubeStatus === 'DRAFT_UPLOADED') && (
                <a
                  href={clip.youtubeUrl || '#'}
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={(e) => e.stopPropagation()}
                  className={`p-1 rounded-full text-white transition-colors shadow-xs ${
                    clip.youtubeStatus === 'PUBLISHED'
                      ? 'bg-red-600/90 hover:bg-red-600'
                      : 'bg-blue-600/90 hover:bg-blue-600'
                  }`}
                  title={
                    clip.youtubeStatus === 'PUBLISHED'
                      ? 'Published on YouTube Shorts'
                      : 'Draft on YouTube Shorts'
                  }
                >
                  <Youtube className='w-3 h-3' />
                </a>
              )}
              {clip.instagramStatus === 'PUBLISHED' && (
                <a
                  href={clip.instagramUrl || '#'}
                  target='_blank'
                  rel='noopener noreferrer'
                  onClick={(e) => e.stopPropagation()}
                  className='p-1 rounded-full bg-pink-600/90 text-white hover:bg-pink-600 transition-colors shadow-xs'
                  title='Published on Instagram Reels'
                >
                  <Instagram className='w-3 h-3' />
                </a>
              )}
            </div>

            {/* Duration Badge */}
            {clip.duration && (
              <span className='inline-flex items-center gap-1 font-mono text-[11px] font-medium px-2 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-xs border border-white/10 shadow-xs'>
                <Clock className='w-2.5 h-2.5 text-gray-400' />
                {`${clip.duration.toFixed(1)}s`}
              </span>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* HOVER OVERLAY: Detailed Info Slide-Up (Active ONLY when paused)    */}
        {/* ------------------------------------------------------------------ */}
        {!isPlaying && (
          <div
            className='absolute inset-0 z-20 bg-gray-950/95 backdrop-blur-md text-white p-3.5 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto overflow-hidden'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top section of hover overlay */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between gap-1'>
                <span className='font-mono font-semibold text-xs text-primary-300 bg-primary-950/60 px-2 py-0.5 rounded border border-primary-500/30'>
                  Clip #{clip.id}
                </span>
                <div className='flex items-center gap-1'>
                  {getClipBadge(clip.status)}
                  <button
                    type='button'
                    onClick={() => onInspect(clip)}
                    className='p-1 text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors'
                    title='Open full inspector'
                  >
                    <Maximize2 className='w-3.5 h-3.5' />
                  </button>
                </div>
              </div>

              <h4 className='text-xs font-semibold text-white line-clamp-2 leading-tight'>
                {clip.title || 'Untitled Clip'}
              </h4>

              {/* Virality Angle / Hook Reason */}
              {clip.viralityReason && (
                <div className='p-2 rounded-lg bg-purple-900/40 border border-purple-500/30 text-purple-200 text-[11px] leading-relaxed max-h-24 overflow-y-auto space-y-1'>
                  <div className='flex items-center gap-1 font-semibold text-amber-300 text-[10px] uppercase tracking-wider'>
                    <Sparkles className='w-3 h-3 text-amber-400 shrink-0' />
                    <span>Virality Rationale</span>
                  </div>
                  <p className='text-purple-100'>{clip.viralityReason}</p>
                </div>
              )}

              {/* Transcript Snippet */}
              {clip.shortsTranscript && (
                <div className='p-2 rounded-lg bg-gray-800/60 border border-gray-700 text-[11px] leading-relaxed text-gray-300 max-h-20 overflow-y-auto'>
                  <div className='flex items-center gap-1 font-semibold text-gray-400 text-[10px] uppercase tracking-wider mb-0.5'>
                    <FileText className='w-3 h-3' />
                    <span>Hook Script</span>
                  </div>
                  <p className='italic line-clamp-3'>"{clip.shortsTranscript}"</p>
                </div>
              )}
            </div>

            {/* Bottom section of hover overlay: Stats & Actions */}
            <div className='space-y-2 pt-2 border-t border-white/10'>
              {/* Tech stats */}
              <div className='grid grid-cols-2 gap-1.5 text-[10px] text-gray-300'>
                <div className='flex items-center gap-1'>
                  <Clock className='w-3 h-3 text-gray-400' />
                  <span>{clip.duration ? `${clip.duration.toFixed(1)}s` : '—'} duration</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Cpu className='w-3 h-3 text-gray-400' />
                  <span>{clip.renderSec ? `${clip.renderSec.toFixed(1)}s` : '—'} render</span>
                </div>
              </div>

              {/* Social publishing links & quick triggers */}
              <div className='flex items-center gap-1.5 text-[10px] flex-wrap'>
                {/* YouTube Shorts */}
                {clip.youtubeStatus === 'UPLOADING' ? (
                  <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800 animate-pulse'>
                    <Loader2 className='w-3 h-3 animate-spin' />
                    <span>YouTube</span>
                  </span>
                ) : clip.youtubeUrl ? (
                  <a
                    href={clip.youtubeUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800 hover:bg-red-900/60'
                    title='Watch on YouTube Shorts'
                  >
                    <Youtube className='w-3 h-3 text-red-400' />
                    <span>YouTube</span>
                    <ExternalLink className='w-2.5 h-2.5' />
                  </a>
                ) : clip.status === 'COMPLETED' && onUpload ? (
                  <button
                    type='button'
                    onClick={() => onUpload(clip, 'YOUTUBE')}
                    className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-800/80 transition-colors cursor-pointer'
                    title='Direct upload to YouTube Shorts'
                  >
                    <Youtube className='w-3 h-3 text-red-400' />
                    <span>+ YouTube</span>
                  </button>
                ) : null}

                {/* Instagram Reels */}
                {clip.instagramStatus === 'UPLOADING' ? (
                  <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800 animate-pulse'>
                    <Loader2 className='w-3 h-3 animate-spin' />
                    <span>Reels</span>
                  </span>
                ) : clip.instagramUrl ? (
                  <a
                    href={clip.instagramUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-pink-950/60 text-pink-300 border border-pink-800 hover:bg-pink-900/60'
                    title='Watch on Instagram Reels'
                  >
                    <Instagram className='w-3 h-3 text-pink-400' />
                    <span>Reels</span>
                    <ExternalLink className='w-2.5 h-2.5' />
                  </a>
                ) : clip.status === 'COMPLETED' && onUpload ? (
                  <button
                    type='button'
                    onClick={() => onUpload(clip, 'INSTAGRAM')}
                    className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-pink-950/50 hover:bg-pink-900/70 text-pink-300 border border-pink-800/80 transition-colors cursor-pointer'
                    title='Direct post to Instagram Reels'
                  >
                    <Instagram className='w-3 h-3 text-pink-400' />
                    <span>+ Reels</span>
                  </button>
                ) : null}
              </div>

              {/* Action buttons */}
              <div className='flex items-center gap-1.5 pt-1'>
                <button
                  type='button'
                  onClick={handleCardPlayToggle}
                  className='flex-1 py-1.5 px-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer'
                >
                  <Play className='w-3.5 h-3.5 fill-current' />
                  <span>Play Clip</span>
                </button>

                {onUpload && (
                  <button
                    type='button'
                    onClick={() => onUpload(clip)}
                    disabled={clip.status !== 'COMPLETED' || clip.youtubeStatus === 'UPLOADING' || clip.instagramStatus === 'UPLOADING'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      clip.youtubeStatus === 'UPLOADING' || clip.instagramStatus === 'UPLOADING'
                        ? 'bg-blue-950/70 border-blue-800 text-blue-400 cursor-wait'
                        : clip.status === 'COMPLETED'
                        ? 'bg-purple-900/60 hover:bg-purple-800 text-purple-200 border-purple-700 hover:text-white cursor-pointer'
                        : 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                    title={
                      clip.youtubeStatus === 'UPLOADING' || clip.instagramStatus === 'UPLOADING'
                        ? 'Upload currently in progress...'
                        : clip.status !== 'COMPLETED'
                        ? `Upload requires COMPLETED status (current: ${clip.status})`
                        : 'Direct Upload / Post to YouTube or Instagram'
                    }
                    data-testid={`card-upload-clip-${clip.id}`}
                  >
                    {clip.youtubeStatus === 'UPLOADING' || clip.instagramStatus === 'UPLOADING' ? (
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                    ) : (
                      <Share2 className='w-3.5 h-3.5' />
                    )}
                  </button>
                )}

                <button
                  type='button'
                  onClick={copyUrl}
                  className='p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors'
                  title='Copy Video URL'
                >
                  {copied ? <Check className='w-3.5 h-3.5 text-emerald-400' /> : <Copy className='w-3.5 h-3.5' />}
                </button>

                {videoUrl && (
                  <a
                    href={videoUrl}
                    download={`clip_${clip.id}.mp4`}
                    className='p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors'
                    title='Download MP4'
                  >
                    <Download className='w-3.5 h-3.5' />
                  </a>
                )}

                <button
                  type='button'
                  onClick={() => onInspect(clip)}
                  className='p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors'
                  title='Inspect Details'
                >
                  <Maximize2 className='w-3.5 h-3.5' />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* BASIC INFO: Always visible underneath the video      */}
      {/* ---------------------------------------------------- */}
      <div className='p-3.5 flex flex-col justify-between flex-1 gap-2 bg-white'>
        <div className='space-y-1'>
          <h4
            className='text-xs font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors cursor-pointer'
            title={clip.title || 'Untitled Clip'}
            onClick={() => onInspect(clip)}
          >
            {clip.title || 'Untitled Clip'}
          </h4>

          {clip.viralityReason && (
            <p
              className='text-[11px] text-gray-500 line-clamp-1 flex items-center gap-1'
              title={clip.viralityReason}
            >
              <Sparkles className='w-3 h-3 text-amber-500 shrink-0' />
              <span className='truncate'>{clip.viralityReason}</span>
            </p>
          )}
        </div>

        {/* Meta Footer Row */}
        <div className='pt-2 border-t border-gray-100 flex items-center justify-between gap-1 text-[11px] text-gray-500'>
          <span className='font-mono'>
            {clip.renderSec ? `${clip.renderSec.toFixed(1)}s render` : 'Ready'}
          </span>
          <span className='text-gray-400'>
            {getCreatedDate(clip.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShortClipCard;
