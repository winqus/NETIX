import { Inject, Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { FileStorage } from './file-storage.abstract';
import { FILE_STORAGE_STRATEGY_TOKEN } from './file-storage.constants';
import {
  FileStorageDeleteFileArgs,
  FileStorageDownloadFileArgs,
  FileStorageDownloadStreamArgs,
  FileStorageGetFileMetadataArgs,
  FileStorageListFilesArgs,
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
   * @throws Error - Throws an error with the message `'ENOENT: File does not exist'` if the file is not found.
   */
  public async downloadFile(args: FileStorageDownloadFileArgs): Promise<Buffer> {
    return this.fileStorageStrategy.downloadFile(args);
  }

  /**
   * Streams a file from the storage.
   *
   * @param args - The arguments required to locate and stream the file: `{ container: string; fileName: string; }`
   * @returns A promise that resolves to a `Readable` stream of the file data.
   * @throws Error - Throws an error with the message `'ENOENT: File does not exist'` if the file is not found.
   */
  public async downloadStream(args: FileStorageDownloadStreamArgs): Promise<Readable> {
    return this.fileStorageStrategy.downloadStream(args);
  }

  /**
   * Retrieves the metadata of a file based on the provided arguments.
   *
   * @param args - The arguments required to get the file metadata.
   * @returns A promise that resolves to the file metadata, type of which depends on the FileStorage type.
   * E. g. for a file stored in the local file system, the metadata would be Stats object.
   */
  public async getFileMetadata(args: FileStorageGetFileMetadataArgs): Promise<unknown> {
    return this.fileStorageStrategy.getFileMetadata(args);
  }

  public async listFiles(args: FileStorageListFilesArgs): Promise<Array<FileInStorage>> {
    return this.fileStorageStrategy.listFiles(args);
  }
}
