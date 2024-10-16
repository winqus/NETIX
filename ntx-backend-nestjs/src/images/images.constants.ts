import { BackdropSize, PosterSize } from './images.types';

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
export const POSTER_CACHE_CONTROL_HEADER_VAL = 'public, max-age=604800';

export const CREATE_POSTER_JOBNAME = 'create-poster-job';
export const CREATE_POSTER_QUEUE = 'images-create-poster-queue';
export const CREATE_POSTER_QUEUE_CONCURRENCY = 3;

export const POSTER_SIZES: Record<PosterSize, { width: number; height: number }> = {
  [PosterSize.XS]: { width: 60, height: 90 },
  [PosterSize.S]: { width: 120, height: 180 },
  [PosterSize.M]: { width: 240, height: 360 },
  [PosterSize.L]: { width: 360, height: 540 },
};

export const BACKDROP_CONTROLLER_BASE_PATH = 'backdrops';
export const BACKDROP_CONTROLLER_VERSION = '1';

export const IMAGES_CREATE_BACKDROP_QUEUE = 'images-create-backdrop-queue';
export const IMAGES_CREATE_BACKDROP_JOBNAME = 'create-backdrop-job';
export const BACKDROP_ID_PREFIX = 'BD_';
export const BACKDROP_ID_LENGTH = 15;
export const IMAGES_BACKDROP_SIZES: Record<BackdropSize, { width: number; height: number }> = {
  [PosterSize.L]: { width: 360, height: 200 },
};

export const BACKDROP_MIME_TYPE = 'image/webp';
export const BACKDROP_EXTENTION = 'webp';

export const IMAGES_BACKDROP_QUEUE_CONCURRENCY = 3;

export const IMAGES_BACKDROP_CONTAINER = 'backdrops';

/* Errors */
export const POSTER_NO_ID_PROVIDED_ERROR = 'No id provided';
export const BACKDROP_NO_ID_PROVIDED_ERROR = 'No id provided';

/* Swagger */
export const IMAGES_SWAGGER_TAG = 'images';
