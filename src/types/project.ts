export type ProjectType =
  | 'FULL_AI_GENERATED_VIDEO'
  | 'AUDIOBOOK'
  | 'TALKING_HEAD_VIDEO'
  | 'REMOTION_VIDEO';

export type ProjectLanguage = 'ENGLISH' | 'GERMAN' | 'SPANISH';

export type ProjectStatus =
  | 'PENDING'
  | 'GENERATING_SCRIPT'
  | 'SCRIPT_GENERATED'
  | 'GENERATING_AUDIO'
  | 'AUDIO_GENERATED'
  | 'GENERATING_VIDEO'
  | 'VIDEO_GENERATED'
  | 'COMPLETED'
  | 'FAILED';

export type PartAssetStatus =
  | 'PENDING'
  | 'GENERATING'
  | 'COMPLETED'
  | 'FAILED';

export type AssetType =
  | 'IMAGE'
  | 'VIDEO'
  | 'TALKING_HEAD'
  | 'REMOTION';

export type ShortsProjectStatus =
  | 'PENDING'
  | 'TRANSCRIBING'
  | 'SEGMENT_SEARCH_IN_PROGRESS'
  | 'VERIFYING'
  | 'CLIPS_IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED';

export type ShortsClipStatus =
  | 'PENDING'
  | 'CARVING_IN_PROGRESS'
  | 'BURNING_SUBTITLES_IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED';

export type SocialUploadStatus =
  | 'NOT_UPLOADED'
  | 'QUEUED'
  | 'UPLOADING'
  | 'DRAFT'
  | 'DRAFT_UPLOADED'
  | 'PUBLISHED'
  | 'FAILED'
  | 'SCHEDULED';

export interface VideoPartAsset {
  id: number;
  teamId: number;
  projectId: number;
  videoPartId: number;
  assetType: AssetType;
  prompt?: string | null;
  generationPromptText?: string | null;
  path?: string | null;
  status: PartAssetStatus;
  desiredDuration?: number | null;
  promptGenSec?: number | null;
  genSec?: number | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  videoPart?: VideoPart;
}

export interface VideoPart {
  id: number;
  teamId: number;
  projectId: number;
  personaId: number;
  sequenceNumber: number;
  partText: string;
  ttsText?: string | null;
  audioPath?: string | null;
  audioStatus: PartAssetStatus;
  audioGenSec?: number | null;
  audioDuration?: number | null;
  wordTimestamps?: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  assets?: VideoPartAsset[];
  persona?: {
    id: number;
    name: string;
  };
}

export interface ScriptIterationLog {
  id: number;
  teamId: number;
  projectId: number;
  attemptNumber: number;
  scriptText: string;
  verdict?: string | null;
  score?: number | null;
  judgeFeedback?: string | null;
  judgeGenSec?: number | null;
  createdAt: string;
}

export interface ShortsClip {
  id: number;
  teamId: number;
  shortsProjectId: number;
  title: string;
  shortsTranscript: string;
  viralityReason?: string | null;
  segments?: unknown;
  status: ShortsClipStatus;
  videoPath?: string | null;
  rawVideoPath?: string | null;
  subtitlesPath?: string | null;
  duration?: number | null;
  renderSec?: number | null;
  subtitlesSec?: number | null;
  retryCount: number;
  errorMessage?: string | null;
  youtubeStatus?: SocialUploadStatus | string | null;
  youtubeUrl?: string | null;
  instagramStatus?: SocialUploadStatus | string | null;
  instagramUrl?: string | null;
  instagramMediaId?: string | null;
  createdAt: string;
  updatedAt: string;
  shortsProject?: ShortsProject;
}

export interface VideoProject {
  id: number;
  teamId: number;
  personaId: number;
  rawInputText: string;
  generatedScript?: string | null;
  roughLengthInMins?: number | null;
  wordCount?: number | null;
  type: ProjectType;
  language: ProjectLanguage;
  status: string;
  isPublished: boolean;
  publishedLink?: string | null;
  youtubeStatus?: SocialUploadStatus | string | null;
  youtubeVideoId?: string | null;
  youtubeUrl?: string | null;
  youtubeStudioUrl?: string | null;
  youtubeUploadedAt?: string | null;
  youtubeErrorMessage?: string | null;
  scriptGenSec?: number | null;
  partsSplittingSec?: number | null;
  ttsRewriteSec?: number | null;
  partsCreationSec?: number | null;
  totalAudioGenSec?: number | null;
  totalVideoGenSec?: number | null;
  upscaleGenSec?: number | null;
  subtitlesGenSec?: number | null;
  exportDirectory?: string | null;
  createdAt: string;
  updatedAt: string;
  persona?: {
    id: number;
    name: string;
  };
  parts?: VideoPart[];
}

export interface CreateProjectRequest {
  personaId: number;
  teamId?: number;
  rawInputText?: string;
  generatedScript?: string | null;
  roughLengthInMins?: number;
  type?: ProjectType;
  language?: ProjectLanguage;
  isPublished?: boolean;
  publishedLink?: string | null;
}

export interface UpdateProjectRequest {
  isPublished?: boolean;
  publishedLink?: string | null;
  rawInputText?: string;
  generatedScript?: string | null;
  roughLengthInMins?: number;
  teamId?: number;
  type?: ProjectType;
  language?: ProjectLanguage;
  status?: string;
}

export interface ShortsProject {
  id: number;
  teamId: number;
  videoProjectId: number;
  status: string;
  transcript?: string | null;
  llmRawOutput?: string | null;
  llmVerifiedOutput?: string | null;
  errorMessage?: string | null;
  transcribeSec?: number | null;
  llmSearchSec?: number | null;
  llmVerifySec?: number | null;
  totalRenderSec?: number | null;
  exportDirectory?: string | null;
  createdAt: string;
  updatedAt: string;
  videoProject?: VideoProject;
  clips?: ShortsClip[];
}

export interface CreateShortsProjectRequest {
  videoProjectId: number;
  teamId?: number;
}

export interface UpdateShortsProjectRequest {
  status?: ShortsProjectStatus | string;
  errorMessage?: string | null;
  teamId?: number;
}

export const VIDEO_PROJECT_STATUS_OPTIONS: { value: string; label: string; description: string }[] = [
  { value: 'PENDING', label: 'Pending / Restart', description: 'Reset project to queue pipeline from start' },
  { value: 'SCRIPT_GENERATION_IN_PROGRESS', label: 'Script Generating', description: 'LLM script generation currently running' },
  { value: 'SCRIPT_GENERATION_COMPLETED', label: 'Script Generated', description: 'Script drafting complete' },
  { value: 'PARTS_SPLITTING_IN_PROGRESS', label: 'Parts Splitting', description: 'Dividing script into video parts' },
  { value: 'PARTS_SPLITTING_COMPLETED', label: 'Parts Split Completed', description: 'Parts divided' },
  { value: 'TTS_SCRIPT_REWRITING_IN_PROGRESS', label: 'TTS Rewriting', description: 'Rewriting lines for voice synthesis' },
  { value: 'TTS_SCRIPT_REWRITING_COMPLETED', label: 'TTS Rewriting Completed', description: 'Voice scripts prepared' },
  { value: 'PARTS_CREATION_IN_PROGRESS', label: 'Parts Creation In Progress', description: 'Creating video part records in database' },
  { value: 'PARTS_CREATION_COMPLETED', label: 'Parts Created', description: 'Video part database records created' },
  { value: 'VIDEO_PLANNING_PENDING', label: 'Video Planning Pending', description: 'Ready for visual scene prompt planning' },
  { value: 'VIDEO_PLANNING_IN_PROGRESS', label: 'Video Planning In Progress', description: 'Generating scene prompts with LLM' },
  { value: 'VIDEO_PLANNING_COMPLETED', label: 'Video Planning Completed', description: 'Scene prompts generated' },
  { value: 'ASSET_GENERATION_IN_PROGRESS', label: 'Asset Generation In Progress', description: 'Rendering visual and audio assets' },
  { value: 'UPSCALING_PENDING', label: 'Upscaling Pending', description: 'Waiting for resolution upscaling' },
  { value: 'UPSCALING_IN_PROGRESS', label: 'Upscaling In Progress', description: 'Upscaling video to higher resolution' },
  { value: 'BURNING_SUBTITLES_PENDING', label: 'Subtitles Pending', description: 'Waiting for subtitles to be burned' },
  { value: 'BURNING_SUBTITLES_IN_PROGRESS', label: 'Burning Subtitles', description: 'Burning subtitle overlay onto master video' },
  { value: 'COMPLETED', label: 'Completed', description: 'Pipeline fully finished' },
  { value: 'FAILED', label: 'Failed', description: 'Error occurred during generation' },
];

export const SHORTS_PROJECT_STATUS_OPTIONS: { value: ShortsProjectStatus; label: string; description: string }[] = [
  { value: 'PENDING', label: 'Pending / Restart', description: 'Restart shorts processing from audio transcription' },
  { value: 'TRANSCRIBING', label: 'Transcribing', description: 'Transcribing audio with Whisper' },
  { value: 'SEGMENT_SEARCH_IN_PROGRESS', label: 'Segment Search', description: 'LLM discovering high-retention viral segments' },
  { value: 'VERIFYING', label: 'Verifying', description: 'LLM verifying candidate segments against video context' },
  { value: 'CLIPS_IN_PROGRESS', label: 'Clips In Progress', description: 'Carving vertical clips and burning subtitles' },
  { value: 'COMPLETED', label: 'Completed', description: 'All clips successfully carved and ready' },
  { value: 'FAILED', label: 'Failed', description: 'Error occurred during shorts conversion pipeline' },
];

export interface ProjectFilterState {
  search: string;
  type?: string;
  status?: string;
  page: number;
  limit: number;
}

export interface UploadProjectRequest {
  teamId?: number;
  platform?: 'YOUTUBE';
  uploadType?: 'DRAFT' | 'ACTUAL_POST';
  customTitle?: string;
  customTags?: string[];
  titlePrefix?: string;
}

export interface UploadShortsClipRequest {
  teamId?: number;
  platform: 'YOUTUBE' | 'INSTAGRAM';
  uploadType?: 'DRAFT' | 'ACTUAL_POST';
  customTitle?: string;
  customCaption?: string;
  customTags?: string[];
}
