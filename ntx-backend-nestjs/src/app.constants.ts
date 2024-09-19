export enum ENVIRONMENTS {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  TEST = 'test',
}

export const ENV = 'NODE_ENV';
export const ENV_FILE = '.env';
export const PORT = 'PORT';
export const DEFAULT_PORT = 3055;

export const GLOBAL_ROUTE_PREFIX = 'api';
export const DEFAULT_CONTROLLER_VERSION = '1';
export const DEFAULT_THROTTLE_TTL = 60000;
export const DEFAULT_THROTTLE_LIMIT = 100;

export const QUEUE_HOST = 'REDIS_HOST';
export const QUEUE_PORT = 'REDIS_PORT';
export const QUEUE_PASSWORD = 'REDIS_PASSWORD';
export const QUEUE_UI_ROUTE = '/queues';

export const DEFAULT_FILE_STORAGE_BASE_DIR_PATH = './data/storage';
export const DEFAULT_TEMP_FILE_STORAGE_BASE_DIR_PATH = './.temp-data/storage';
