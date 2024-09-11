import * as fse from 'fs-extra';
import { resolve } from 'path';
import {
  FILE_ALREADY_EXISTS,
  FILE_STORAGE_CONTAINER_DELIM,
  FILE_STORAGE_LOCAL_CONTAINER_NAME_REGEX,
  FILE_STORAGE_LOCAL_FILE_NAME_REGEX,
  INVALID_CONTAINER_NAME,
  INVALID_FILE_NAME,
} from '../file-storage.constants';
import { FileStorageArgs, FileStorageConfig, FileStorageUploadSingleFileArgs } from '../file-storage.interfaces';
import { FileStorageConfigFactory } from '../file-storage.types';
import { FileStorage } from '../FileStorage';
import { defaultFactory } from './file-storage-local-config-default.factory';
import { FileStorageLocalSetup } from './file-storage-local.types';

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

  public async uploadSingleFile(args: FileStorageUploadSingleFileArgs): Promise<void> {
    const { container, fileName, content } = args;

    const filePath = this.transformToLocalFilePath({ container, fileName });

    if (fse.existsSync(filePath)) {
      throw new Error(FILE_ALREADY_EXISTS);
    }

    await fse.ensureFile(filePath);

    return fse.writeFile(filePath, content);
  }
}
