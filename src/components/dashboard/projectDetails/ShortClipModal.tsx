import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Clock,
  Cpu,
  FileText,
  Youtube,
  Instagram,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { ShortsClip, ShortsClipStatus } from '@/types/project';
import { Button } from '@/components/ui/button';
import { getCreatedDate } from '@/utils/utils';

interface ShortClipModalProps {
  clip: ShortsClip | null;
  onClose: () => void;
}

const getModalStatusBadge = (status: ShortsClipStatus | string) => {
  const upper = (status || '').toUpperCase();
  if (upper === 'COMPLETED') {
    return (
      <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
        Completed
      </span>
    );
  }
  if (upper === 'FAILED') {
    return (
      <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-error-50 text-error-700 border border-error-200'>
        Failed
      </span>
    );
  }
  if (upper === 'BURNING_SUBTITLES_IN_PROGRESS') {
    return (
      <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200'>
        <span className='w-2 h-2 rounded-full bg-purple-500 animate-pulse' />
        Burning Subtitles
      </span>
    );
  }
  if (upper === 'CARVING_IN_PROGRESS') {
    return (
      <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200'>
        <span className='w-2 h-2 rounded-full bg-blue-500 animate-pulse' />
        Carving Clip
      </span>
    );
  }
  return (
    <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200'>
      Pending
    </span>
  );
};

export const ShortClipModal: React.FC<ShortClipModalProps> = ({ clip, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!clip) return null;

  const videoPath = clip.videoPath || clip.rawVideoPath;
  const normalizedPath = videoPath ? videoPath.replace(/\\/g, '/') : '';
  const cleanPath = normalizedPath.includes('storage/')
    ? normalizedPath.substring(normalizedPath.indexOf('storage/'))
    : normalizedPath;
  const videoUrl = cleanPath ? `http://localhost:6001/${cleanPath}` : null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const copyVideoUrl = () => {
    if (!videoUrl) return;
    navigator.clipboard.writeText(videoUrl);
    setCopiedUrl(true);
    toast.success('Clip video URL copied to clipboard');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div
      className='fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200'
      onClick={onClose}
    >
      <div
        className='relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col md:flex-row border border-gray-200'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-3 right-3 z-30 p-2 rounded-full bg-white/90 hover:bg-gray-100 text-gray-500 hover:text-gray-900 shadow-md transition-colors border border-gray-200'
          title='Close preview'
        >
          <X className='w-4 h-4' />
        </button>

        {/* Left Side: 9:16 Vertical Video Player */}
        <div className='md:w-1/2 bg-gray-950 flex items-center justify-center relative min-h-[380px] md:min-h-[560px] p-4 select-none'>
          {videoUrl ? (
            <div className='relative w-full max-w-[320px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl bg-black border border-white/10 group'>
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                playsInline
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className='w-full h-full object-cover'
              />

              {/* Quick Play/Pause and Mute Overlay on Hover */}
              <div className='absolute bottom-16 right-3 flex items-center gap-2 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity'>
                <button
                  type='button'
                  onClick={toggleMute}
                  className='p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-xs shadow-md border border-white/20 transition-all'
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className='w-4 h-4' /> : <Volume2 className='w-4 h-4' />}
                </button>
                <button
                  type='button'
                  onClick={togglePlay}
                  className='p-2 rounded-full bg-primary-600/90 hover:bg-primary-600 text-white shadow-md border border-white/20 transition-all'
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className='w-4 h-4' /> : <Play className='w-4 h-4' />}
                </button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center text-center p-6 space-y-3 text-gray-400'>
              <AlertCircle className='w-12 h-12 text-amber-500 animate-bounce' />
              <p className='text-sm font-medium text-white'>
                {clip.status === 'FAILED'
                  ? 'Video generation failed'
                  : 'Video file is still being rendered...'}
              </p>
              {clip.errorMessage && (
                <p className='text-xs text-error-400 max-w-xs'>{clip.errorMessage}</p>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Detailed Clip Metadata */}
        <div className='md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[500px] md:max-h-[580px] space-y-5 bg-white'>
          <div className='space-y-4'>
            {/* Header info */}
            <div>
              <div className='flex items-center gap-2 flex-wrap mb-2'>
                <span className='font-mono font-semibold text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200'>
                  Clip #{clip.id}
                </span>
                {getModalStatusBadge(clip.status)}
                {clip.duration && (
                  <span className='inline-flex items-center gap-1 font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md'>
                    <Clock className='w-3 h-3 text-gray-500' />
                    {clip.duration.toFixed(1)}s
                  </span>
                )}
              </div>
              <h2 className='text-base font-bold text-gray-900 leading-snug'>
                {clip.title || 'Untitled Clip'}
              </h2>
            </div>

            {/* Virality Angle / Hook Rationale Card */}
            {clip.viralityReason && (
              <div className='p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1.5'>
                <div className='flex items-center gap-1.5 text-xs font-semibold text-purple-900'>
                  <Sparkles className='w-3.5 h-3.5 text-purple-600' />
                  <span>Virality Angle & Hook Rationale</span>
                </div>
                <p className='text-xs text-purple-950 leading-relaxed'>
                  {clip.viralityReason}
                </p>
              </div>
            )}

            {/* Transcript Snippet */}
            {clip.shortsTranscript && (
              <div className='p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5'>
                <div className='flex items-center gap-1.5 text-xs font-semibold text-gray-800'>
                  <FileText className='w-3.5 h-3.5 text-gray-500' />
                  <span>Clip Transcript & Voiceover Script</span>
                </div>
                <p className='text-xs text-gray-600 italic leading-relaxed max-h-36 overflow-y-auto pr-1'>
                  "{clip.shortsTranscript}"
                </p>
              </div>
            )}

            {/* Performance & Technical Metrics */}
            <div className='grid grid-cols-2 gap-2 text-xs'>
              <div className='p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex flex-col gap-0.5'>
                <span className='text-gray-400 flex items-center gap-1 text-[11px]'>
                  <Cpu className='w-3 h-3' />
                  Render Time
                </span>
                <span className='font-mono font-semibold text-gray-800'>
                  {clip.renderSec ? `${clip.renderSec.toFixed(2)}s` : '—'}
                </span>
              </div>
              <div className='p-2.5 rounded-lg bg-gray-50 border border-gray-200 flex flex-col gap-0.5'>
                <span className='text-gray-400 flex items-center gap-1 text-[11px]'>
                  <Clock className='w-3 h-3' />
                  Subtitles Burning
                </span>
                <span className='font-mono font-semibold text-gray-800'>
                  {clip.subtitlesSec ? `${clip.subtitlesSec.toFixed(2)}s` : '—'}
                </span>
              </div>
            </div>

            {/* Social Media Distribution */}
            <div className='space-y-2 pt-1'>
              <span className='text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5'>
                <Share2 className='w-3 h-3' />
                Social Distribution
              </span>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {/* YouTube Shorts */}
                <div className='p-2.5 rounded-lg border border-gray-200 flex items-center justify-between gap-2 bg-white'>
                  <div className='flex items-center gap-2'>
                    <Youtube className='w-4 h-4 text-red-600 shrink-0' />
                    <div className='flex flex-col'>
                      <span className='text-xs font-medium text-gray-900'>YouTube Shorts</span>
                      <span className='text-[10px] text-gray-500'>
                        {clip.youtubeStatus || 'Not Uploaded'}
                      </span>
                    </div>
                  </div>
                  {clip.youtubeUrl && (
                    <a
                      href={clip.youtubeUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors'
                      title='Open YouTube Short'
                    >
                      <ExternalLink className='w-3.5 h-3.5' />
                    </a>
                  )}
                </div>

                {/* Instagram Reels */}
                <div className='p-2.5 rounded-lg border border-gray-200 flex items-center justify-between gap-2 bg-white'>
                  <div className='flex items-center gap-2'>
                    <Instagram className='w-4 h-4 text-pink-600 shrink-0' />
                    <div className='flex flex-col'>
                      <span className='text-xs font-medium text-gray-900'>Instagram Reels</span>
                      <span className='text-[10px] text-gray-500'>
                        {clip.instagramStatus || 'Not Uploaded'}
                      </span>
                    </div>
                  </div>
                  {clip.instagramUrl && (
                    <a
                      href={clip.instagramUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='p-1 text-pink-600 hover:text-pink-700 hover:bg-pink-50 rounded-md transition-colors'
                      title='Open Instagram Reel'
                    >
                      <ExternalLink className='w-3.5 h-3.5' />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className='pt-3 border-t border-gray-200 flex items-center justify-between gap-2 flex-wrap'>
            <span className='text-xs text-gray-400'>
              Created {getCreatedDate(clip.createdAt)}
            </span>
            <div className='flex items-center gap-2'>
              {videoUrl && (
                <>
                  <Button
                    variant='secondary-gray'
                    size='sm'
                    onClick={copyVideoUrl}
                    className='text-xs flex items-center gap-1.5'
                  >
                    {copiedUrl ? (
                      <>
                        <Check className='w-3.5 h-3.5 text-success-600' />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className='w-3.5 h-3.5' />
                        <span>Copy URL</span>
                      </>
                    )}
                  </Button>

                  <Button
                    asChild
                    size='sm'
                    className='bg-primary-600 hover:bg-primary-700 text-white text-xs flex items-center gap-1.5 shadow-sm'
                  >
                    <a
                      href={videoUrl}
                      download={`clip_${clip.id}.mp4`}
                      title='Download MP4'
                    >
                      <Download className='w-3.5 h-3.5' />
                      <span>Download</span>
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortClipModal;
