import { FileToStorageContainerInterceptorArgs } from '@ntx/file-storage/interceptors/file-to-storage-container.interceptor';

export const MOVIES_CONTROLLER_BASE_PATH = 'movies';
export const MOVIES_CONTROLLER_VERSION = '1';
export const MOVIES_IMPORT_CONTROLLER_BASE_PATH = 'movies-import';
export const MOVIES_IMPORT_CONTROLLER_VERSION = '1';
export const MOVIES_POSTER_TEMP_STORAGE_CONTAINER = 'raw-uploads';
export const MOVIES_POSTER_INPUT_MIME_TYPES = ['image/webp', 'application/octet-stream'];
export const MOVIES_POSTER_MAX_SIZE_IN_BYTES = 10_024_000; // 10 MB
export const MOVIES_POSTER_FILE_FIELD_NAME = 'poster';
export const MOVIES_POSTER_DEFAULT_ID = 'MT-default-poster';
export const MOVIES_BACKDROP_TEMP_STORAGE_CONTAINER = 'raw-uploads';
export const MOVIES_BACKDROP_FILE_FIELD_NAME = 'backdrop';
export const MOVIES_BACKDROP_MAX_SIZE_IN_BYTES = 10_024_000; // 10 MB
export const MOVIES_BACKDROP_INPUT_MIME_TYPES = ['image/webp', 'application/octet-stream'];
export const MOVIES_VIDEO_TEMP_STORAGE_CONTAINER = 'raw-uploads';
export const MOVIES_VIDEO_FILE_FIELD_NAME = 'video';
export const MOVIES_VIDEO_MAX_SIZE_IN_BYTES = 10_000_000_000; // 10 GB
export const MOVIES_VIDEO_INPUT_MIME_TYPES = ['application/octet-stream'];
export const MOVIES_ID_PREFIX = 'MT-';
export const MOVIES_ID_LENGTH = 15;

export const MOVIES_POSTER_FILE_STORAGE_ARGS: FileToStorageContainerInterceptorArgs = {
  container: MOVIES_POSTER_TEMP_STORAGE_CONTAINER,
  field: MOVIES_POSTER_FILE_FIELD_NAME,
  maxSize: MOVIES_POSTER_MAX_SIZE_IN_BYTES,
  allowedMimeTypes: MOVIES_POSTER_INPUT_MIME_TYPES,
};

export const MOVIES_BACKDROP_FILE_STORAGE_ARGS: FileToStorageContainerInterceptorArgs = {
  container: MOVIES_BACKDROP_TEMP_STORAGE_CONTAINER,
  field: MOVIES_BACKDROP_FILE_FIELD_NAME,
  maxSize: MOVIES_BACKDROP_MAX_SIZE_IN_BYTES,
  allowedMimeTypes: MOVIES_BACKDROP_INPUT_MIME_TYPES,
};

export const MOVIES_VIDEOS_FILE_STORAGE_ARGS: FileToStorageContainerInterceptorArgs = {
  container: MOVIES_VIDEO_TEMP_STORAGE_CONTAINER,
  field: MOVIES_VIDEO_FILE_FIELD_NAME,
  maxSize: MOVIES_VIDEO_MAX_SIZE_IN_BYTES,
  allowedMimeTypes: MOVIES_VIDEO_INPUT_MIME_TYPES,
};

export const MOVIES_NAME_LENGTH_MIN = 1;
export const MOVIES_NAME_LENGTH_MAX = 200;
export const MOVIES_SUMMARY_LENGTH_MIN = 1;
export const MOVIES_SUMMARY_LENGTH_MAX = 1_000;
export const MOVIES_RUNTIME_MINS_MIN = 0;
export const MOVIES_RUNTIME_MINS_MAX = 12_000;

/* Cache */
export enum MOVIES_CACHE_KEY {
  GET_ALL = 'movies-get-all',
}

export const MOVIES_CACHE_OPTS = {
  [MOVIES_CACHE_KEY.GET_ALL]: {
    ttl: 10_000 /* miliseconds */,
  },
};

/* Mongoose */
export const MOVIES_MODEL_TOKEN = 'MOVIES_MODEL';
export const MOVIES_SCHEMA_NAME = 'Movie';

/* Errors */
export const MOVIES_EMPTY_DTO_ERROR = 'Empty DTO provided';
export const MOVIES_NO_FILE_PROVIDED_ERROR = 'No file provided';
export const MOVIES_NO_ID_PROVIDED_ERROR = 'No id provided';
export const MOVIES_NOT_FOUND_ERROR = 'Movie not found';

/* Swagger */
export const MOVIES_SWAGGER_TAG = 'movies';
