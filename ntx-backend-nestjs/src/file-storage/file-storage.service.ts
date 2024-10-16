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

  /**
   * Downloads a file from the storage.
   *
   * @param args - The arguments required to locate and download the file: `{ container: string; fileName: string; }`
   * @returns A promise that resolves to a `Buffer` containing the file data.
   * @throws Error - Throws an error with the message `'File does not exist'` if the file is not found.
   */
  public async downloadFile(args: FileStorageDownloadFileArgs): Promise<Buffer> {
    return this.fileStorageStrategy.downloadFile(args);
  }

  /**
   * Streams a file from the storage.
   *
   * @param args - The arguments required to locate and stream the file: `{ container: string; fileName: string; }`
   * @returns A promise that resolves to a `Readable` stream of the file data.
   * @throws Error - Throws an error with the message `'File does not exist'` if the file is not found.
   */
  public async downloadStream(args: FileStorageDownloadStreamArgs): Promise<Readable> {
    return this.fileStorageStrategy.downloadStream(args);
  }
}
