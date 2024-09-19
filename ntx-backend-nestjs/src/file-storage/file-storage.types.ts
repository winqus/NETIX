import { FileStorageConfig } from './file-storage.interfaces';

export type FileStorageConfigFactory<T extends Record<string, any>, S extends Record<string, any>> = (
  setup: S,
) => T & FileStorageConfig;
