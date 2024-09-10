export const CONTROLLER_VERSION = '1';
export const CONTROLLER_BASE_PATH = 'thumbnails';

export const UPLOAD_THROTTLE_OPTIONS = { limit: 3, ttl: 1000 };

export const THUMBNAIL_FILE = {
  MAX_FILE_SIZE: 1024 * 100, // 100 KB
  INPUT_MIME_TYPES: ['image/webp', 'application/octet-stream'],
  MIME_TYPE: 'image/webp',
  EXTENTION: 'webp',
  FIELD_NAME: 'thumbnail',
  TARGET_WIDTH: 480,
  TARGET_HEIGHT: 720,
};
export const THUMBNAIL_TEMP_DIR = './data/upload/temp/thumbnails';
export const THUMBNAIL_DIR = './data/thumbnails';
export const thumbnailFileName = (ID: string) => `th${ID}.webp`;

export const THUMBNAIL_QUEUE = 'thumbnail-queue';
export const THUMBNAIL_QUEUE_CONCURRENCY = 3;
export const THUMBNAIL_QUEUE_JOBS = {
  PROCESS_THUMBNAIL: 'process-thumbnail',
};

export const THUMBNAIL_SCHEMA_NAME = 'Thumbnail';
export const THUMBNAIL_MODEL = 'THUMBNAIL_MODEL';
