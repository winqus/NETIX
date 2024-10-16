import { PosterSize } from './images.types';

/* Images Proxy */
export const IMAGES_PROXY_CONTROLLER_BASE_PATH = 'images-proxy';

/* Posters */
export const POSTER_CONTROLLER_BASE_PATH = 'poster';
export const POSTER_CONTROLLER_VERSION = '1';
export const POSTER_MIME_TYPE = 'image/webp';
export const POSTER_EXTENTION = 'webp';
export const POSTER_ID_PREFIX = 'P_';
export const POSTER_ID_LENGTH = 15;
export const POSTER_FILE_CONTAINER = 'posters';

export const CREATE_POSTER_JOBNAME = 'create-poster-job';
export const CREATE_POSTER_QUEUE = 'images-create-poster-queue';
export const CREATE_POSTER_QUEUE_CONCURRENCY = 3;

export const POSTER_SIZES: Record<PosterSize, { width: number; height: number }> = {
  [PosterSize.XS]: { width: 60, height: 90 },
  [PosterSize.S]: { width: 120, height: 180 },
  [PosterSize.M]: { width: 240, height: 360 },
  [PosterSize.L]: { width: 360, height: 540 },
};

/* Errors */
export const POSTER_NO_ID_PROVIDED_ERROR = 'No id provided';

/* Swagger */
export const IMAGES_SWAGGER_TAG = 'images';
