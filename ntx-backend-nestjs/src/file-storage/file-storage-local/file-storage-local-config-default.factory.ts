import * as fse from 'fs-extra';
import { normalize, resolve, sep } from 'path';
import { FileStorageLocalSetup } from './file-storage-local.types';

export function defaultFactory(setup: FileStorageLocalSetup) {
  const { storageBaseDirPath } = setup;

  const normalizedPath = normalize(storageBaseDirPath + sep);

  const fullPath = resolve(normalizedPath);

  let storageDirExists = true;
  try {
    fse.accessSync(fullPath);
  } catch (_error) {
    storageDirExists = false;
  }

  if (storageDirExists == false) {
    fse.mkdirSync(fullPath, { recursive: true });
  }

  return { storageBaseDirPath: fullPath };
}
