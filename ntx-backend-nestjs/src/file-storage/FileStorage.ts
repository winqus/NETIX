/* eslint-disable @typescript-eslint/no-unused-vars */

import { METHOD_NOT_IMPLEMENTED_ERROR } from './file-storage.constants';
import {
  FileStorageConfig,
  FileStorageDeleteFileArgs,
  FileStorageUploadSingleFileArgs,
  FileStorageUploadStreamArgs,
} from './file-storage.interfaces';
import { FileInStorage, WritableStreamWithDoneEvent } from './types';

export abstract class FileStorage {
  readonly config?: FileStorageConfig & Record<string, any>;

  uploadSingleFile(args: FileStorageUploadSingleFileArgs): Promise<FileInStorage> {
    throw new Error(METHOD_NOT_IMPLEMENTED_ERROR);
  }

  uploadStream(args: FileStorageUploadStreamArgs): Promise<WritableStreamWithDoneEvent> {
    throw new Error(METHOD_NOT_IMPLEMENTED_ERROR);
  }

  deleteFile(args: FileStorageDeleteFileArgs): Promise<boolean> {
    throw new Error(METHOD_NOT_IMPLEMENTED_ERROR);
  }
}
