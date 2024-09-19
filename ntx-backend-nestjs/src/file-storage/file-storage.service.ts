import { Inject, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { FileStorage } from './file-storage.abstract';
import { FILE_STORAGE_STRATEGY_TOKEN } from './file-storage.constants';
import {
  FileStorageDeleteFileArgs,
  FileStorageDownloadFileArgs,
  FileStorageDownloadStreamArgs,
  FileStorageUploadSingleFileArgs,
  FileStorageUploadStreamArgs,
} from './file-storage.interfaces';
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

  public async downloadFile(args: FileStorageDownloadFileArgs): Promise<Buffer> {
    return this.fileStorageStrategy.downloadFile(args);
  }

  public async downloadStream(args: FileStorageDownloadStreamArgs): Promise<Readable> {
    return this.fileStorageStrategy.downloadStream(args);
  }
}
