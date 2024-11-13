import { KvStore, Upload } from '@tus/server';
import { FileStorage } from '../file-storage.abstract';
import { FileInStorage } from '../types';

export interface FileStorageFileConfigStoreOptions {
  destinationContainer: string;
  fileStorage: FileStorage;
}

export class FileStorageFileConfigStore<T = Upload> implements KvStore<T> {
  destinationContainer: string;
  fileStorage: FileStorage;

  constructor({ destinationContainer, fileStorage }: FileStorageFileConfigStoreOptions) {
    this.destinationContainer = destinationContainer;
    this.fileStorage = fileStorage;
  }

  public async get(key: string): Promise<T | undefined> {
    try {
      const buffer = await this.fileStorage.downloadFile(this.resolve(key));

      return JSON.parse(buffer.toString('utf8'));
    } catch {
      return undefined;
    }
  }

  public async set(key: string, value: T): Promise<void> {
    await this.fileStorage.uploadSingleFile({
      ...this.resolve(key),
      content: Buffer.from(JSON.stringify(value)),
      overwriteIfExists: true,
    });
  }

  public async delete(key: string): Promise<void> {
    try {
      await this.fileStorage.deleteFile(this.resolve(key));
    } catch (_) {
      return;
    }
  }

  public async list(): Promise<Array<string>> {
    const files = await this.fileStorage.listFiles({ container: this.destinationContainer });
    const sorted = files.map((file) => file.fileName).sort((a, b) => a.localeCompare(b));

    const removeExt = (filename: string) => filename.replace('.json', '');

    return sorted.filter((file, i) => i < sorted.length - 1 && removeExt(file) === removeExt(sorted[i + 1]));
  }

  private resolve(key: string): FileInStorage {
    return { container: this.destinationContainer, fileName: key + '.json' };
  }
}
