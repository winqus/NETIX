import { Stream } from 'stream';
import { FileStorageLocalSetup } from './file-storage-local/file-storage-local.types';
import { FileStorageConfigFactory } from './file-storage.types';

export enum StorageType {
  LocalFileSystem = 'LocalFileSystem',
}

export interface FileInStorage {
  container: string;
  fileName: string;
}

export interface FileStorageLocalOptions<Config extends Record<string, unknown>> {
  setup: FileStorageLocalSetup;
  factory?: FileStorageConfigFactory<Config, FileStorageLocalSetup>;
}

export type FileStorageModuleOptions<Config extends Record<string, unknown> = Record<string, unknown>> = {
  [StorageType.LocalFileSystem]: FileStorageLocalOptions<Config>;
};

export interface WritableStreamWithDoneEvent extends NodeJS.WritableStream, Stream {
  emit(event: 'done', error?: Error): boolean;
  addListener(event: 'done', listener: (error?: Error) => void): this;
  on(event: 'done', listener: (error?: Error) => void): this;
  once(event: 'done', listener: (error?: Error) => void): this;
  prependOnceListener(event: 'done', listener: (error?: Error) => void): this;
  prependListener(event: 'done', listener: (error?: Error) => void): this;
  removeListener(event: 'done', listener: () => void): this;
}
