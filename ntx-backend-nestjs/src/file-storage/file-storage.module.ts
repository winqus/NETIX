import { DynamicModule, Logger, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { FILE_STORAGE_BASE_DIR_PATH, TEMP_FILE_STORAGE_BASE_DIR_PATH } from '@ntx/app.constants';
import { FileStorage } from './FileStorage';
import { FileStorageLocal } from './file-storage-local/FileStorageLocal';
import { FILE_STORAGE_STRATEGY_TOKEN } from './file-storage.constants';
import { FileStorageService } from './file-storage.service';
import { FileStorageModuleOptions, StorageType } from './types';

export function getFileStorageStrategy<S extends StorageType, E extends Record<string, unknown>>(
  storageType: S,
  config: FileStorageModuleOptions<E>[S],
): FileStorageLocal {
  const { setup, factory } = config as FileStorageModuleOptions<E>[S];

  switch (storageType) {
    case StorageType.LocalFileSystem:
      return new FileStorageLocal(setup, factory);
    default:
      throw new Error(`Invalid storage type: ${storageType}`);
  }
}

@Module({})
export class FileStorageModule implements OnApplicationShutdown {
  public static forRoot(
    storageType: StorageType,
    options: Partial<FileStorageModuleOptions<Record<string, unknown>>> = {
      [StorageType.LocalFileSystem]: { setup: { storageBaseDirPath: FILE_STORAGE_BASE_DIR_PATH } },
    },
    isGlobal?: boolean,
  ): DynamicModule {
    if (!(storageType in options)) {
      throw new Error(`${storageType} options is missing.`);
    }

    const fileStorage = getFileStorageStrategy(storageType, options[storageType]!);

    const providers: [Provider<FileStorage>, Provider<FileStorageService>] = [
      { provide: FILE_STORAGE_STRATEGY_TOKEN, useValue: fileStorage },
      FileStorageService,
    ];

    if (process.env.USE_TEMPORARY_FILE_STORAGE === 'true' && storageType === StorageType.LocalFileSystem) {
      const tempDirPath = options[StorageType.LocalFileSystem]!.setup!.storageBaseDirPath;

      if (tempDirPath !== require('path').resolve(TEMP_FILE_STORAGE_BASE_DIR_PATH)) {
        throw new Error(
          `Invalid temporary directory path: ${tempDirPath}. It should be ${TEMP_FILE_STORAGE_BASE_DIR_PATH}`,
        );
      }

      new Logger('FileStorageModule').warn(
        `FileStorage will use temp dir "${TEMP_FILE_STORAGE_BASE_DIR_PATH}" that's removed on shutdown (e.g. Ctrl+C)`,
      );
    }

    return {
      module: FileStorageModule,
      global: isGlobal,
      providers: providers,
      exports: providers,
    };
  }

  async onApplicationShutdown(_signal?: string) {
    if (process.env.USE_TEMPORARY_FILE_STORAGE === 'true') {
      const path = require('path').resolve(TEMP_FILE_STORAGE_BASE_DIR_PATH);
      const fse = require('fs-extra');

      if (fse.existsSync(path)) {
        new Logger('FileStorageModule').warn(`Removing temporary file storage directory ${path}`);
        fse.rmSync(path, { recursive: true });
      }
    }
  }
}
