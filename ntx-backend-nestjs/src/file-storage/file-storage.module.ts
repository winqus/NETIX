import { DynamicModule, Logger, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { DEFAULT_FILE_STORAGE_BASE_DIR_PATH, DEFAULT_TEMP_FILE_STORAGE_BASE_DIR_PATH } from '@ntx/app.constants';
import { FileStorageLocal } from './file-storage-local/file-storage-local.class';
import { FileStorage } from './file-storage.abstract';
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
      [StorageType.LocalFileSystem]: { setup: { storageBaseDirPath: DEFAULT_FILE_STORAGE_BASE_DIR_PATH } },
    },
    isGlobal?: boolean,
  ): DynamicModule {
    if (!(storageType in options)) {
      throw new Error(`${storageType} options is missing.`);
    }

    if (process.env.USE_TEMPORARY_FILE_STORAGE === 'true' && storageType === StorageType.LocalFileSystem) {
      const tempDirPath = require('path').resolve(
        process.env.TEMP_FILE_STORAGE_BASE_DIR_PATH ||
          options[StorageType.LocalFileSystem]?.setup?.storageBaseDirPath ||
          DEFAULT_TEMP_FILE_STORAGE_BASE_DIR_PATH,
      );

      options = { ...options, [StorageType.LocalFileSystem]: { setup: { storageBaseDirPath: tempDirPath } } };

      new Logger('FileStorageModule').warn(
        `FileStorage will use temp dir: \n"${tempDirPath}" that's removed on shutdown (e.g. Ctrl+C)`,
      );
    }

    const fileStorage = getFileStorageStrategy(storageType, options[storageType]!);

    const providers: [Provider<FileStorage>, Provider<FileStorageService>] = [
      { provide: FILE_STORAGE_STRATEGY_TOKEN, useValue: fileStorage },
      FileStorageService,
    ];

    return {
      module: FileStorageModule,
      global: isGlobal,
      providers: providers,
      exports: providers,
    };
  }

  async onApplicationShutdown(_signal?: string) {
    if (process.env.USE_TEMPORARY_FILE_STORAGE === 'true') {
      const path = require('path').resolve(DEFAULT_TEMP_FILE_STORAGE_BASE_DIR_PATH);
      const fse = require('fs-extra');

      if (fse.existsSync(path)) {
        new Logger('FileStorageModule').warn(`Removing temporary file storage directory ${path}`);
        fse.rmSync(path, { recursive: true });
      }
    }
  }
}
