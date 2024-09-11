export const FILE_STORAGE_CONTAINER_DELIM = '.';
export const FILE_STORAGE_STRATEGY_TOKEN = 'file_storage_strategy_token';

export const FILE_STORAGE_LOCAL_CONTAINER_NAME_REGEX = /^([a-z0-9\-]+\.?){0,10}[a-z0-9\-]+$/;
export const FILE_STORAGE_LOCAL_FILE_NAME_REGEX = /^[^~)('!*<>:;,?"*|/\\]+$/;

// Error messages
export const METHOD_NOT_IMPLEMENTED_ERROR = 'This FileStorage method is not implemented';
export const INVALID_CONTAINER_NAME = 'Invalid container name';
export const INVALID_FILE_NAME = 'Invalid file name';
export const FILE_ALREADY_EXISTS = 'File already exists';
