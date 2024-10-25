import * as fse from 'fs-extra';
import { resolve } from 'path';
import { finished, Readable } from 'stream';
import { FileStorage } from '../file-storage.abstract';
import {
  FILE_ALREADY_EXISTS,
  FILE_STORAGE_CONTAINER_DELIM,
  FILE_STORAGE_LOCAL_CONTAINER_NAME_REGEX,
  FILE_STORAGE_LOCAL_FILE_NAME_REGEX,
  INVALID_CONTAINER_NAME,
  INVALID_FILE_NAME,
} from '../file-storage.constants';
import {
  FileStorageArgs,
  FileStorageConfig,
  FileStorageDeleteFileArgs,
  FileStorageDownloadFileArgs,
  FileStorageDownloadStreamArgs,
  FileStorageGetFileMetadataArgs,
  FileStorageUploadSingleFileArgs,
} from '../file-storage.interfaces';
import { FileStorageConfigFactory } from '../file-storage.types';
import { FileInStorage, WritableStreamWithDoneEvent } from '../types';
import { defaultFactory } from './file-storage-local-config-default.factory';
import { FileStorageLocalSetup, FileStorageLocalUploadStreamArgs, FileStreamOptions } from './file-storage-local.types';

type Stats = fse.Stats;

export class FileStorageLocal implements FileStorage {
  readonly config: FileStorageConfig & Record<string, any>;

  constructor(
    setup: FileStorageLocalSetup,
    factory?: FileStorageConfigFactory<FileStorageConfig, FileStorageLocalSetup>,
  ) {
    if (typeof factory === 'function') {
      this.config = factory(setup);
    } else {
      this.config = defaultFactory(setup);
    }
  }

  private isValidContainerName(container: string): boolean {
    return FILE_STORAGE_LOCAL_CONTAINER_NAME_REGEX.test(container);
  }

  private isValidFileName(fileName: string) {
    return FILE_STORAGE_LOCAL_FILE_NAME_REGEX.test(fileName);
  }

  private transformToLocalFilePath({ container, fileName }: FileStorageArgs) {
    if (this.isValidContainerName(container) === false) {
      throw new Error(INVALID_CONTAINER_NAME);
    }

    if (this.isValidFileName(fileName) === false) {
      throw new Error(INVALID_FILE_NAME);
    }

    const dirSegments = container.split(FILE_STORAGE_CONTAINER_DELIM);

    const fullLocalFilePath = resolve(this.config.storageBaseDirPath, ...dirSegments, fileName);

    return fullLocalFilePath;
  }

  public async uploadSingleFile(args: FileStorageUploadSingleFileArgs): Promise<FileInStorage> {
    const { container, fileName, content } = args;
    const filePath = this.transformToLocalFilePath({ container, fileName });

    if (fse.existsSync(filePath)) {
      throw new Error(FILE_ALREADY_EXISTS);
    }

    await fse.ensureFile(filePath);

    await fse.writeFile(filePath, content);

    return {
      container,
      fileName,
    };
  }

  public async uploadStream(args: FileStorageLocalUploadStreamArgs): Promise<WritableStreamWithDoneEvent> {
    const { container, fileName, options } = args;
    const filePath = this.transformToLocalFilePath({ container, fileName });

    if (!this.isFileWrittenAtOffset(options as any) && fse.existsSync(filePath)) {
      throw new Error(FILE_ALREADY_EXISTS);
    }

    await fse.ensureFile(filePath);

    const writeStream = fse.createWriteStream(filePath, options);
    finished(writeStream, (error) => writeStream.emit('done', error));

    return writeStream;
  }

  public async deleteFile(args: FileStorageDeleteFileArgs): Promise<boolean> {
    const { container, fileName } = args;
    const filePath = this.transformToLocalFilePath({ container, fileName });

    return new Promise((resolve, reject) => {
      fse
        .remove(filePath)
        .then(() => {
          resolve(true);
        })
        .catch((error) => {
          reject(error as unknown as Error);
        });
    });
  }

  public async downloadFile(args: FileStorageDownloadFileArgs): Promise<Buffer> {
    const { container, fileName } = args;
    const filePath = this.transformToLocalFilePath({ container, fileName });
    this.throwErrorIfFileDoesNotExist(filePath);

    return fse.readFile(filePath);
  }

  public async downloadStream(args: FileStorageDownloadStreamArgs): Promise<Readable> {
    const { container, fileName } = args;
    const filePath = this.transformToLocalFilePath({ container, fileName });
    this.throwErrorIfFileDoesNotExist(filePath);

    return fse.createReadStream(filePath);
  }

  public async getFileMetadata(args: FileStorageGetFileMetadataArgs): Promise<Stats> {
    const { container, fileName } = args;
    const filePath = this.transformToLocalFilePath({ container, fileName });
    this.throwErrorIfFileDoesNotExist(filePath);

    return fse.stat(filePath);
  }

  private throwErrorIfFileDoesNotExist(filePath: string) {
    if (fse.existsSync(filePath) === false) {
      throw new Error('ENOENT: File does not exist');
    }
  }

  private isFileWrittenAtOffset(options: FileStreamOptions) {
    return 'start' in options && typeof options.start === 'number' && options.start >= 0;
  }
}
