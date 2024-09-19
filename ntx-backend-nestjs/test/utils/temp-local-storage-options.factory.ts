import { StorageType } from '@ntx/file-storage/types';

export function tempLocalStorageOptionsFactory(tempDirPath: string) {
  return {
    storageType: StorageType.LocalFileSystem,
    options: {
      [StorageType.LocalFileSystem]: { setup: { storageBaseDirPath: require('path').resolve(tempDirPath) } },
    },
  };
}
