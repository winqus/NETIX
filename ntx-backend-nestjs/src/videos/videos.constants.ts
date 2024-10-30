import { FileExt } from '@ntx/common/enums/file-extentions.enum';
import { MimeType } from '@ntx/common/enums/mime-type.enum';

export const VIDEOS_FILE_ALLOWED_MIME_TYPES: string[] = [MimeType.VIDEO_X_MATROSKA];
export const VIDEOS_FILE_ALLOWED_EXTENTIONS: string[] = [FileExt.MKV];
export const VIDEOS_FILE_MAX_SIZE_IN_BYTES = 10_000_000_000; // 10 GB

/* Swagger */
export const VIDEOS_SWAGGER_TAG = 'videos';
