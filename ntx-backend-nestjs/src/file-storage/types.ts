import { FileStorageLocalSetup } from './file-storage-local/file-storage-local.types';
import { FileStorageConfigFactory } from './file-storage.types';

export enum StorageType {
  LocalFileSystem = 'LocalFileSystem',
}

export interface FileStorageLocalOptions<Config extends Record<string, unknown>> {
  setup: FileStorageLocalSetup;
  factory?: FileStorageConfigFactory<Config, FileStorageLocalSetup>;
}

export type FileStorageModuleOptions<Config extends Record<string, unknown> = Record<string, unknown>> = {
  [StorageType.LocalFileSystem]: FileStorageLocalOptions<Config>;
};
