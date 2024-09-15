import { FileInStorage } from '../types';

export function fileInStorageFromRaw(raw: any): FileInStorage {
  return { container: raw.container, fileName: raw.fieldName };
}
