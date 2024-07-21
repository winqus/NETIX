export const CONTROLLER_VERSION = '1';
export const CONTROLLER_BASE_PATH = 'videos';

export const UPLOAD_THROTTLE_OPTIONS = { limit: 3, ttl: 1000 };

export const VIDEO_FILE = {
  MAX_FILE_SIZE: 1024 * 1024 * 1024 * 10, // 10 GB
  INPUT_MIME_TYPES: ['video/x-matroska' /*, 'application/octet-stream'*/],
  EXTENTION: 'mkv',
  FIELD_NAME: 'video',
};
export const VIDEO_TEMP_DIR = './data/upload/temp/videos/';
export const VIDEO_DIR = './data/videos/';
export const videoFileName = (ID: string) => `v${ID}.mkv`;

export const VIDEO_QUEUE = 'video-queue';
export const VIDEO_QUEUE_CONCURRENCY = 3;
export const VIDEO_QUEUE_JOBS = {
  PROCESS_VIDEO: 'process-video',
};

export const VIDEO_PROCESSED_EVENT = 'video.fileProcessed';

export const VIDEO_SCHEMA_NAME = 'Video';
export const VIDEO_MODEL = 'VIDEO_MODEL';
