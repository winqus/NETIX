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

/* SWAGGER OpenAPI documentation constants */
/* Increment version when: <new max controller version>.<method added/removed>.<existing method(s) changed> */
/* If higher order version is changed, lower order versions should be reset to 0 */
export const SWAGGER_VERSION = '1.4.0';
export const SWAGGER_ROUTE = 'swagger';
export const SWAGGER_JSON_ROUTE = 'swagger/json';
export const SWAGGER_YAML_ROUTE = 'swagger/yaml';
export const SWAGGER_TITLE = 'NETIX BE API';
export const SWAGGER_DESCRIPTION =
  'NETIX backend API specification. Go to ' +
  '<a href="/swagger/json">/swagger/json</a> or ' +
  '<a href="/swagger/yaml">/swagger/yaml</a> ' +
  'to get the OpenAPI document in JSON or YAML format.';
export const SWAGGER_TAGS = ['movies', 'images', 'library', 'videos', 'default'];
