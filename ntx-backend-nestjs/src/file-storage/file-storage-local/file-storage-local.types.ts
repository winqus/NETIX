import { FileStorageUploadStreamArgs } from '../file-storage.interfaces';

export type FileStorageLocalSetup = {
  storageBaseDirPath: string;
};

export type FileStreamOptions = {
  flags?: string;
  encoding?: BufferEncoding;
  fd?: number;
  mode?: number;
  autoClose?: boolean;
  emitClose?: boolean;
  start?: number;
  end?: number;
  highWaterMark?: number;
};
export interface FileStorageLocalUploadStreamArgs extends FileStorageUploadStreamArgs {
  options?: BufferEncoding | FileStreamOptions;
}
