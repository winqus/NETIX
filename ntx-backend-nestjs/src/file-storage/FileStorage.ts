/* eslint-disable @typescript-eslint/no-unused-vars */

import { METHOD_NOT_IMPLEMENTED_ERROR } from './file-storage.constants';
import { FileStorageConfig, FileStorageUploadSingleFileArgs } from './file-storage.interfaces';

export abstract class FileStorage {
  readonly config?: FileStorageConfig & Record<string, any>;

  uploadSingleFile(args: FileStorageUploadSingleFileArgs): Promise<void> {
    throw new Error(METHOD_NOT_IMPLEMENTED_ERROR);
  }
}
