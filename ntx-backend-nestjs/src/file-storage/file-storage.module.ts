import { DynamicModule, Module, Provider } from '@nestjs/common';
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
export class FileStorageModule {
  public static forRoot(
    storageType: StorageType,
    options: Partial<FileStorageModuleOptions<Record<string, unknown>>> = {
      [StorageType.LocalFileSystem]: { setup: { storageBaseDirPath: './data/local-store' } },
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

    return {
      module: FileStorageModule,
      global: isGlobal,
      providers: providers,
      exports: providers,
    };
  }
}
