import { Inject, Injectable } from '@nestjs/common';
import { FILE_STORAGE_STRATEGY_TOKEN } from './file-storage.constants';
import {
  FileStorageDeleteFileArgs,
  FileStorageUploadSingleFileArgs,
  FileStorageUploadStreamArgs,
} from './file-storage.interfaces';
import { FileStorage } from './FileStorage';
import { FileInStorage, WritableStreamWithDoneEvent } from './types';

@Injectable()
export class FileStorageService implements FileStorage {
  constructor(@Inject(FILE_STORAGE_STRATEGY_TOKEN) private readonly fileStorageStrategy: FileStorage) {}

  public async uploadSingleFile(args: FileStorageUploadSingleFileArgs): Promise<FileInStorage> {
    return this.fileStorageStrategy.uploadSingleFile(args);
  }

  public async uploadStream(args: FileStorageUploadStreamArgs): Promise<WritableStreamWithDoneEvent> {
    return this.fileStorageStrategy.uploadStream(args);
  }

  public async deleteFile(args: FileStorageDeleteFileArgs): Promise<boolean> {
    return this.fileStorageStrategy.deleteFile(args);
  }
}
