export const CONTROLLER_VERSION = '1';
export const CONTROLLER_BASE_PATH = 'thumbnails';

export const UPLOAD_THROTTLE_OPTIONS = { limit: 3, ttl: 1000 };

export const THUMBNAIL_FILE = {
  MAX_FILE_SIZE: 1024 * 100, // 100 KB
  MIME_TYPES: ['image/webp', 'application/octet-stream'],
  FIELD_NAME: 'thumbnail',
};

export const THUMBNAIL_TEMP_DIR = './data/upload/temp/thumbnails';
