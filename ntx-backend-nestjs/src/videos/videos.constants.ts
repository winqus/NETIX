import { FileExt } from '@ntx/common/enums/file-extentions.enum';
import { MimeType } from '@ntx/common/enums/mime-type.enum';

export const VIDEOS_FILE_ALLOWED_MIME_TYPES: string[] = [MimeType.VIDEO_X_MATROSKA];
export const VIDEOS_FILE_ALLOWED_EXTENTIONS: string[] = [FileExt.MKV];
export const VIDEOS_FILE_MAX_SIZE_IN_BYTES = 10_000_000_000; // 10 GB
export const VIDEO_FILE_CONTAINER = 'videos';
export const VIDEOS_ID_PREFIX = 'VD_';
export const VIDEOS_ID_LENGTH = 15;
export const VIDEOS_NAME_LENGTH_MIN = 1;
export const VIDEOS_NAME_LENGTH_MAX = 200;
export const VIDEOS_RUNTIME_MINS_MIN = 0;
export const VIDEOS_RUNTIME_MINS_MAX = 12_000;

/* Queue */
export const PROCESS_VIDEO_JOBNAME = 'process-video-job';
export const PROCESS_VIDEO_QUEUE = 'process-video-queue';
export const PROCESS_VIDEO_QUEUE_CONCURRENCY = 1;
export const DELETE_VIDEO_JOBNAME = 'delete-video-job';
export const DELETE_VIDEO_QUEUE = 'delete-video-queue';
export const DELETE_VIDEO_QUEUE_CONCURRENCY = 1;

/* Mongoose */
export const VIDEOS_MODEL_TOKEN = 'VIDEOS_MODEL';
export const VIDEOS_SCHEMA_NAME = 'Video';

/* Errors */
export const VIDEOS_ERROR_NO_ID_PROVIDED = 'No video ID provided';
export const VIDEOS_ERROR_NOT_FOUND = 'Video not found';

/* Swagger */
export const VIDEOS_SWAGGER_TAG = 'videos';
