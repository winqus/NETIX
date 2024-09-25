import { ApiBodyOptions, getSchemaPath } from '@nestjs/swagger';
import { FileToStorageContainerInterceptorArgs } from '@ntx/file-storage/interceptors/file-to-storage-container.interceptor';
import { CreateMovieDTO } from './dto/create-movie.dto';

export const MOVIES_CONTROLLER_BASE_PATH = 'movies';
export const MOVIES_CONTROLLER_VERSION = '1';
export const MOVIES_POSTER_TEMP_STORAGE_CONTAINER = 'raw-uploads';
export const MOVIES_POSTER_INPUT_MIME_TYPES = ['image/webp', 'application/octet-stream'];
export const MOVIES_POSTER_MAX_SIZE_IN_BYTES = 102_400; // 100 KB
export const MOVIES_POSTER_FILE_FIELD_NAME = 'poster';

export const MOVIES_POSTER_STORAGE_ARGS: FileToStorageContainerInterceptorArgs = {
  container: MOVIES_POSTER_TEMP_STORAGE_CONTAINER,
  field: MOVIES_POSTER_FILE_FIELD_NAME,
  maxSize: MOVIES_POSTER_MAX_SIZE_IN_BYTES,
  allowedMimeTypes: MOVIES_POSTER_INPUT_MIME_TYPES,
};

export const MOVIES_NAME_LENGTH_MIN = 1;
export const MOVIES_NAME_LENGTH_MAX = 200;
export const MOVIES_SUMMARY_LENGTH_MIN = 1;
export const MOVIES_SUMMARY_LENGTH_MAX = 1000;
export const MOVIES_RUNTIME_MINS_MIN = 1;
export const MOVIES_RUNTIME_MINS_MAX = 12000;

/* Mongoose */
export const MOVIES_MODEL_TOKEN = 'MOVIES_MODEL';
export const MOVIES_SCHEMA_NAME = 'Movie';

/* Errors */
export const MOVIES_NO_FILE_PROVIDED_ERROR = 'No file provided';
export const MOVIES_NO_ID_PROVIDED_ERROR = 'No id provided';

/* Swagger */
export const MOVIES_SWAGGER_TAG = 'movies';
export const MOVIES_CREATE_SWAGGER_API_BODY_OPTIONS: ApiBodyOptions = {
  schema: {
    type: 'object',
    allOf: [
      { $ref: getSchemaPath(CreateMovieDTO) },
      { properties: { poster: { type: 'string', format: 'binary' } }, required: ['poster'] },
    ],
  },
  description: 'Body combines properties of CreateMovieDTO and a <i>poster</i> file in multipart/form-data format.',
};
