import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Youtube,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  ExternalLink,
  Tag,
  FileText,
  Radio,
} from 'lucide-react';
import { VideoProject, UploadProjectRequest } from '@/types/project';
import { useUploadProjectMutation, parseUploadError, UploadErrorInfo } from '@/queries/projectActions';
import { useAppSelector } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProjectUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject | null;
}

export const ProjectUploadModal: React.FC<ProjectUploadModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const token = useAppSelector((store) => store.auth.token);
  const { mutateAsync: uploadProject, isLoading } = useUploadProjectMutation(token);

  const [uploadType, setUploadType] = useState<'DRAFT' | 'ACTUAL_POST'>('DRAFT');
  const [customTitle, setCustomTitle] = useState('');
  const [titlePrefix, setTitlePrefix] = useState('');
  const [customTags, setCustomTags] = useState('');
  const [errorInfo, setErrorInfo] = useState<UploadErrorInfo | null>(null);

  useEffect(() => {
    if (project) {
      setCustomTitle(project.rawInputText ? project.rawInputText.slice(0, 100) : '');
      setTitlePrefix('');
      setCustomTags('ai, generated, video');
      setUploadType('DRAFT');
      setErrorInfo(null);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const isCompleted = project.status === 'COMPLETED';
  const isUploading = project.youtubeStatus === 'UPLOADING';
  const isPublished = project.youtubeStatus === 'PUBLISHED';
  const canUpload = isCompleted && !isUploading && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpload) return;

    setErrorInfo(null);
    const tagsArray = customTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: UploadProjectRequest = {
      platform: 'YOUTUBE',
      uploadType,
      customTitle: customTitle.trim() || undefined,
      titlePrefix: titlePrefix.trim() || undefined,
      customTags: tagsArray.length > 0 ? tagsArray : undefined,
    };

    try {
      await uploadProject({ id: project.id, payload });
      onClose();
    } catch (err: unknown) {
      const parsed = parseUploadError(err, 'project');
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
        aria-labelledby='upload-project-modal-title'
      >
        {/* Header Banner */}
        <div className='p-5 border-b border-gray-100 flex items-start justify-between gap-3 bg-gradient-to-r from-red-50/60 via-purple-50/30 to-white'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shadow-xs'>
              <Youtube className='w-5 h-5' />
            </div>
            <div>
              <h3 id='upload-project-modal-title' className='text-base font-bold text-gray-900 leading-snug'>
                Direct Upload to YouTube
              </h3>
              <p className='text-xs text-gray-500 mt-0.5'>
                Export 1440p Master video for Project #{project.id}
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
                <p className='font-semibold'>Project Not Completed</p>
                <p className='mt-0.5 text-amber-800'>
                  This project status is currently <span className='font-mono font-semibold'>{project.status}</span>.
                  Direct upload requires the project to be in <span className='font-semibold'>COMPLETED</span> status.
                </p>
              </div>
            </div>
          ) : isUploading ? (
            <div className='p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-2.5 text-xs'>
              <Loader2 className='w-4 h-4 text-blue-600 animate-spin shrink-0' />
              <div>
                <p className='font-semibold'>Upload In Progress</p>
                <p className='mt-0.5 text-blue-800'>
                  This project is currently uploading to YouTube. Please wait for the upload to finish.
                </p>
              </div>
            </div>
          ) : isPublished ? (
            <div className='p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-2 text-xs'>
              <div className='flex items-center gap-2'>
                <CheckCircle2 className='w-4 h-4 text-emerald-600 shrink-0' />
                <span>Video is already published on YouTube.</span>
              </div>
              {project.youtubeUrl && (
                <a
                  href={project.youtubeUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 underline'
                >
                  Watch
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
                      ? 'YouTube Account Not Connected'
                      : errorInfo.isAlreadyUploading
                      ? 'Upload Conflict (409)'
                      : errorInfo.isNotFound
                      ? 'Project Not Found (404)'
                      : 'Upload Failed'}
                  </p>
                  <p className='text-red-700 leading-relaxed'>{errorInfo.message}</p>
                </div>
              </div>

              {errorInfo.isAccountNotLinked && (
                <div className='pt-2 border-t border-red-200/80 flex items-center justify-between'>
                  <span className='text-[11px] text-red-600'>
                    Link YouTube channel in Persona Settings to enable uploads.
                  </span>
                  <Link
                    to={`/dashboard/personas/${project.personaId}?tab=integrations`}
                    target='_blank'
                    className='inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-xs transition-colors'
                  >
                    Open Social Settings
                    <ExternalLink className='w-3 h-3' />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Upload Destination & Mode Selector */}
          <div className='space-y-2'>
            <Label className='text-xs font-semibold text-gray-700 flex items-center gap-1.5'>
              <Radio className='w-3.5 h-3.5 text-primary-600' />
              YouTube Upload Type
            </Label>
            <div className='grid grid-cols-2 gap-2.5'>
              <button
                type='button'
                onClick={() => setUploadType('DRAFT')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  uploadType === 'DRAFT'
                    ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-500 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-semibold text-gray-900'>Studio Draft</span>
                  <span className='px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-100 text-primary-700'>
                    Default
                  </span>
                </div>
                <p className='text-[11px] text-gray-500 mt-1 leading-snug'>
                  Uploads privately to YouTube Studio so you can verify chapters & thumbnail before making public.
                </p>
              </button>

              <button
                type='button'
                onClick={() => setUploadType('ACTUAL_POST')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  uploadType === 'ACTUAL_POST'
                    ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-semibold text-gray-900'>Live Post</span>
                  <span className='px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700'>
                    Instant
                  </span>
                </div>
                <p className='text-[11px] text-gray-500 mt-1 leading-snug'>
                  Immediately publishes the video publicly on your linked YouTube channel.
                </p>
              </button>
            </div>
          </div>

          {/* Custom Title */}
          <div className='space-y-1.5'>
            <Label htmlFor='project-custom-title' className='text-xs font-semibold text-gray-700 flex items-center gap-1'>
              <FileText className='w-3.5 h-3.5 text-gray-400' />
              Video Title (Optional)
            </Label>
            <Input
              id='project-custom-title'
              type='text'
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder='Defaults to project script title'
              maxLength={100}
              className='text-xs'
            />
          </div>

          {/* Title Prefix & Tags in two columns */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='project-title-prefix' className='text-xs font-semibold text-gray-700'>
                Title Prefix (Optional)
              </Label>
              <Input
                id='project-title-prefix'
                type='text'
                value={titlePrefix}
                onChange={(e) => setTitlePrefix(e.target.value)}
                placeholder='e.g. [Exclusive]'
                className='text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='project-custom-tags' className='text-xs font-semibold text-gray-700 flex items-center gap-1'>
                <Tag className='w-3.5 h-3.5 text-gray-400' />
                Tags (Comma Separated)
              </Label>
              <Input
                id='project-custom-tags'
                type='text'
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                placeholder='ai, tech, video'
                className='text-xs'
              />
            </div>
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
              className='bg-red-600 hover:bg-red-700 text-white text-xs flex items-center gap-1.5 shadow-sm min-w-[130px] justify-center'
            >
              {isLoading ? (
                <>
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Youtube className='w-3.5 h-3.5 fill-current' />
                  <span>{uploadType === 'DRAFT' ? 'Upload Draft' : 'Post Live to YouTube'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectUploadModal;
