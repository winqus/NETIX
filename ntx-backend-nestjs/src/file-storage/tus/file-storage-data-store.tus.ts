import { Logger } from '@nestjs/common';
import { Configstore } from '@tus/file-store';
import { DataStore, ERRORS, Upload } from '@tus/server';
import type http from 'node:http';
import * as stream from 'node:stream';
import { FileStorage } from '../file-storage.abstract';

export interface FileStorageDataStoreOptions {
  destinationContainer: string;
  fileStorage: FileStorage;
  configstore: Configstore;
  expirationPeriodInMilliseconds?: number;
  logger?: Logger;
}

export class FileStorageDataStore extends DataStore {
  private readonly destinationContainer: string;
  private readonly fileStorage: FileStorage;
  private readonly configstore: Configstore;
  private readonly expirationPeriodInMilliseconds: number;
  private readonly logger: Logger;

  constructor({
    destinationContainer,
    fileStorage,
    configstore,
    expirationPeriodInMilliseconds,
    logger,
  }: FileStorageDataStoreOptions) {
    super();
    this.destinationContainer = destinationContainer;
    this.fileStorage = fileStorage;
    this.configstore = configstore;
    this.expirationPeriodInMilliseconds = expirationPeriodInMilliseconds ?? 0;
    this.logger = logger ?? new Logger(FileStorageDataStore.name);
    this.extensions = ['creation', 'creation-with-upload', 'creation-defer-length', 'termination', 'expiration'];
  }

  public async create(file: Upload): Promise<Upload> {
    try {
      if (file.id.includes('/')) {
        this.logger.warn(`File ID ${file.id} contains '/' which can cause issues with file storage, replaced with '-'`);
        file.id = file.id.replace(/\//g, '-');
      }

      const fileInStorage = await this.fileStorage.uploadSingleFile({
        container: this.destinationContainer,
        fileName: file.id,
        content: Buffer.from(''),
      });
      await this.configstore.set(file.id, file);

      file.storage = { type: 'file', path: fileInStorage.fileName, bucket: this.destinationContainer };

      return file;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  public async remove(file_id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.fileStorage
        .deleteFile({
          container: this.destinationContainer,
          fileName: file_id,
        })
        .then(() => {
          try {
            resolve(this.configstore.delete(file_id));
          } catch (error) {
            reject(error as Error);
          }
        })
        .catch((error) => {
          this.logger.error(`remove: Error deleting file ${file_id}:`);
          this.logger.error(error);
          reject(ERRORS.FILE_NOT_FOUND as unknown as Error);
        });
    });
  }

  public async write(
    readable: http.IncomingMessage | stream.Readable,
    fileID: string,
    offset: number,
  ): Promise<number> {
    const writable = await this.fileStorage.uploadStream({
      container: this.destinationContainer,
      fileName: fileID,
      options: {
        flags: 'r+',
        start: offset,
      },
    });

    let bytesReceived = 0;
    const transform = new stream.Transform({
      transform(chunk, _, callback) {
        bytesReceived += chunk.length;
        callback(null, chunk);
      },
    });

    return new Promise((resolve, reject) => {
      stream.pipeline(readable, transform, writable, (error) => {
        if (error) {
          this.logger.error(`write: Error writing to file ${fileID}:`);
          this.logger.error(error);

          return reject(ERRORS.FILE_WRITE_ERROR as unknown as Error);
        }

        offset += bytesReceived;

        return resolve(offset);
      });
    });
  }

  public async getUpload(id: string): Promise<Upload> {
    const file = await this.configstore.get(id);

    if (file == null) {
      throw ERRORS.FILE_NOT_FOUND;
    }

    return new Promise((resolve, reject) => {
      this.fileStorage
        .getFileMetadata({
          container: this.destinationContainer,
          fileName: file.id,
        })
        .then((stats) => {
          if (!stats || typeof stats !== 'object' || !('size' in stats) || typeof stats.size !== 'number') {
            this.logger.error(`Could not get file size for ${file.id}`);

            return reject(new Error('Could not get file size'));
          }

          return resolve(
            new Upload({
              id,
              size: file.size,
              offset: (stats as any).size,
              metadata: file.metadata,
              creation_date: file.creation_date,
              storage: { type: 'file', path: file.id, bucket: this.destinationContainer },
            }),
          );
        })
        .catch((error) => {
          const isNotFound = error.message.includes('ENOENT');
          if (isNotFound && file) {
            this.logger.error(`File ${file.id} no longer exists, but db record exists`);

            return reject(ERRORS.FILE_NO_LONGER_EXISTS as unknown as Error);
          }

          if (isNotFound) {
            this.logger.error(`File ${file.id} not found`);

            return reject(ERRORS.FILE_NOT_FOUND as unknown as Error);
          }

          return reject(error as Error);
        });
    });
  }

  public async declareUploadLength(id: string, upload_length: number) {
    const file = await this.configstore.get(id);

    if (file == null) {
      this.logger.error(`declareUploadLength: File ${id} not found`);

      throw ERRORS.FILE_NOT_FOUND;
    }

    file.size = upload_length;

    await this.configstore.set(id, file);
  }

  public async deleteExpired(): Promise<number> {
    const now = new Date();
    const toDelete: Promise<void>[] = [];

    if (!this.configstore.list) {
      this.logger.error('deleteExpired: Unsupported expiration extension');

      throw ERRORS.UNSUPPORTED_EXPIRATION_EXTENSION;
    }

    const uploadKeys = await this.configstore.list();
    for (const fileID of uploadKeys) {
      try {
        const info = await this.configstore.get(fileID);
        if (
          info &&
          'creation_date' in info &&
          this.getExpiration() > 0 &&
          info.size !== info.offset &&
          info.creation_date
        ) {
          const creation = new Date(info.creation_date);
          const expires = new Date(creation.getTime() + this.getExpiration());
          if (now > expires) {
            toDelete.push(this.remove(fileID));
          }
        }
      } catch (error) {
        if (error !== ERRORS.FILE_NO_LONGER_EXISTS) {
          this.logger.error(`deleteExpired: Error deleting file ${fileID}:`);
          this.logger.error(error);

          throw error;
        }
      }
    }

    await Promise.all(toDelete);

    return toDelete.length;
  }

  public getExpiration(): number {
    return this.expirationPeriodInMilliseconds;
  }
}
