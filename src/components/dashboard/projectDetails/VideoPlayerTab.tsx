import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  DownloadIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon,
  FilmIcon,
  AlertCircleIcon,
  SparklesIcon,
  InfoIcon,
} from 'lucide-react';
import { VideoProject } from '@/types/project';
import { Button } from '@/components/ui/button';

interface VideoPlayerTabProps {
  project: VideoProject;
}

export const VideoPlayerTab = ({ project }: VideoPlayerTabProps) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Determine stream URL for 480p stitched video
  const videoUrl = `http://localhost:6001/storage/assets/project_${project.id}/stitched_video_480p.mp4`;

  const copyUrl = () => {
    navigator.clipboard.writeText(videoUrl);
    setCopiedUrl(true);
    toast.success('Video stream URL copied');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <FilmIcon className='w-4 h-4 text-primary-600' />
            <h3 className='text-sm font-semibold text-gray-900'>
              Generated 480p Video Player
            </h3>
            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-primary-100 text-primary-800 border border-primary-200 font-mono'>
              480p SD Base
            </span>
          </div>
          <p className='text-xs text-gray-500 mt-1'>
            Full-length stitched multi-scene video composed from all sequential audio voiceovers and multimodal visual assets.
          </p>
        </div>

        <div className='flex items-center gap-2 flex-wrap'>
          <Button
            variant='secondary-gray'
            size='sm'
            onClick={copyUrl}
            className='text-xs flex items-center gap-1.5'
          >
            {copiedUrl ? (
              <>
                <CheckIcon className='w-3.5 h-3.5 text-success-600' />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon className='w-3.5 h-3.5' />
                <span>Copy Video URL</span>
              </>
            )}
          </Button>

          <Button
            asChild
            variant='secondary-gray'
            size='sm'
            className='text-xs flex items-center gap-1.5'
          >
            <a
              href={videoUrl}
              target='_blank'
              rel='noopener noreferrer'
              title='Open raw video file in new tab'
            >
              <ExternalLinkIcon className='w-3.5 h-3.5' />
              Open In Tab
            </a>
          </Button>

          <Button
            asChild
            size='sm'
            className='bg-primary-600 hover:bg-primary-700 text-white text-xs flex items-center gap-1.5 shadow-sm'
          >
            <a
              href={videoUrl}
              download={`project_${project.id}_480p.mp4`}
              title='Download MP4 video'
            >
              <DownloadIcon className='w-3.5 h-3.5' />
              Download 480p MP4
            </a>
          </Button>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className='rounded-2xl border border-gray-200 bg-gray-950 overflow-hidden shadow-md max-w-4xl mx-auto'>
        <div className='relative aspect-video w-full flex items-center justify-center bg-black'>
          {videoError ? (
            <div className='text-center p-8 space-y-3'>
              <AlertCircleIcon className='w-10 h-10 text-amber-500 mx-auto' />
              <h4 className='text-sm font-semibold text-white'>
                480p Video Not Ready or Generating
              </h4>
              <p className='text-xs text-gray-400 max-w-md mx-auto leading-relaxed'>
                The stitched video file is not yet available at <code className='text-gray-300 font-mono'>stitched_video_480p.mp4</code>.
                Current pipeline status: <span className='text-amber-400 font-semibold'>{project.status}</span>.
                Once audio generation and asset rendering complete, the video will automatically be playable here.
              </p>
            </div>
          ) : (
            <video
              ref={videoRef}
              controls
              playsInline
              preload='metadata'
              onError={() => setVideoError(true)}
              className='w-full h-full object-contain'
              data-testid='video-player-480p'
            >
              <source src={videoUrl} type='video/mp4' />
              Your browser does not support HTML5 video streaming.
            </video>
          )}
        </div>

        {/* Video Player Bottom Bar Info */}
        <div className='p-4 bg-gray-900 border-t border-gray-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs'>
          <div className='flex items-center gap-3 flex-wrap'>
            <span className='font-mono text-gray-300'>
              stitched_video_480p.mp4
            </span>
            <span className='text-gray-600'>•</span>
            <span className='text-gray-400'>
              Format: <span className='text-gray-200 font-medium'>MP4 (H.264 / AAC)</span>
            </span>
            <span className='text-gray-600'>•</span>
            <span className='text-gray-400'>
              Target Length: <span className='text-gray-200 font-medium'>{project.roughLengthInMins ? `${project.roughLengthInMins} min` : 'N/A'}</span>
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-950 text-primary-300 border border-primary-800'>
              <SparklesIcon className='w-3 h-3 text-primary-400' />
              480p Base Stitch
            </span>
          </div>
        </div>
      </div>

      {/* Technical Specifications & Synthesis Metadata */}
      <div className='p-5 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4 max-w-4xl mx-auto'>
        <div className='flex items-center gap-2'>
          <InfoIcon className='w-4 h-4 text-primary-600' />
          <h4 className='text-xs font-bold text-gray-900 uppercase tracking-wide'>
            480p Stitched Video Technical Information
          </h4>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs'>
          <div className='p-3 rounded-lg bg-gray-50 border border-gray-100'>
            <span className='text-gray-500 font-medium'>Resolution & Aspect</span>
            <p className='mt-1 font-semibold text-gray-900'>854 × 480 (16:9 Standard Def)</p>
          </div>

          <div className='p-3 rounded-lg bg-gray-50 border border-gray-100'>
            <span className='text-gray-500 font-medium'>Audio Voiceover Timing</span>
            <p className='mt-1 font-semibold text-gray-900 font-mono'>
              {project.totalAudioGenSec ? `${project.totalAudioGenSec.toFixed(2)}s` : 'Processing'}
            </p>
          </div>

          <div className='p-3 rounded-lg bg-gray-50 border border-gray-100'>
            <span className='text-gray-500 font-medium'>Visual Render Timing</span>
            <p className='mt-1 font-semibold text-gray-900 font-mono'>
              {project.totalVideoGenSec ? `${project.totalVideoGenSec.toFixed(2)}s` : 'Processing'}
            </p>
          </div>

          <div className='p-3 rounded-lg bg-gray-50 border border-gray-100 sm:col-span-2 md:col-span-3'>
            <span className='text-gray-500 font-medium'>Storage Directory & Output Target</span>
            <p className='mt-1 font-mono text-xs text-gray-800 break-all'>
              {project.exportDirectory ? (
                `${project.exportDirectory}\\stitched_video_480p.mp4`
              ) : (
                `storage/assets/project_${project.id}/stitched_video_480p.mp4`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerTab;
