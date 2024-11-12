import { Injectable, Logger } from '@nestjs/common';
import { generateHash } from '@ntx/common/utils/generate-hash.utils';
import { Server, Upload } from '@tus/server';
import { Request } from 'express';
import { FileStorageService } from '../file-storage.service';
import { FileInStorage } from '../types';
import { FileStorageDataStore } from './file-storage-data-store.tus';
import { FileStorageFileConfigStore } from './file-storage-file-config-store.tus';

export type UploadArgs = {
  container: string;
  maxSize: number;
  allowedMimeTypes?: string[];
};

@Injectable()
export class TusUploadService {
  private readonly tusServers: Map<string, Server> = new Map();

  private readonly logger: Logger = new Logger(TusUploadService.name);

  constructor(private readonly fileStorageSrv: FileStorageService) {}

  public getTusServer(args: UploadArgs): Server {
    const argHash = generateHash(JSON.stringify(args));

    if (this.tusServers.has(argHash)) {
      return this.tusServers.get(argHash)!;
    }

    const tusServer = this.createTusServer(args);
    this.tusServers.set(argHash, tusServer);

    return tusServer;
  }

  public isTusRequest(req: Request): boolean {
    return (
      req.method === 'POST' ||
      req.method === 'PATCH' ||
      req.method === 'HEAD' ||
      req.headers['upload-offset'] !== undefined
    );
  }

  /**
   * Handles the upload process for TUS requests. Sets the response headers and status code.
   * After this method is called - the response SHOULD NOT be modified.
   *
   * @param {UploadArgs} args The arguments required for the upload.
   * @param {Request} req The HTTP request object.
   * @param {any} res The HTTP response object.
   * @returns {Promise<FileInStorage | null>} A promise that resolves to the uploaded file if upload is finished.
   */
  public async handleUpload(args: UploadArgs, req: Request, res: any): Promise<FileInStorage | null> {
    if (!this.isTusRequest(req)) {
      throw new Error('Request is not a TUS request');
    }

    const tusServer = this.getTusServer(args);

    return new Promise((resolve, _reject) => {
      tusServer.handle(req, res).then(() => {
        const fileInStorage = (req as any)['fileInStorage'];

        if (fileInStorage == null) {
          return resolve(null);
        }

        resolve(fileInStorage);
      });
    });
  }

  private createTusServer(args: UploadArgs): Server {
    const { container, maxSize, allowedMimeTypes } = args;

    const tusServer = new Server({
      path: 'left-as-mandatory-argument',
      datastore: new FileStorageDataStore({
        destinationContainer: container,
        fileStorage: this.fileStorageSrv,
        configstore: new FileStorageFileConfigStore({
          destinationContainer: container + '.' + 'metadata',
          fileStorage: this.fileStorageSrv,
        }),
        expirationPeriodInMilliseconds: 0,
      }),
      maxSize: maxSize,
      generateUrl: (req, options) => {
        return `${options.proto}://${options.host}${req.url}/${options.id}`;
      },
      onUploadCreate: async (_req, res, upload) => {
        this.logger.log(`Upload '${upload.id}' created`);
        this.validateUploadMimeTypeOrThrowTusError(upload, allowedMimeTypes);

        return res;
      },
      onUploadFinish: async (req, res, upload) => {
        this.logger.log(`Upload '${upload.id}' finished`);
        this.attachFileInStorageToRequest(req, upload);

        return res;
      },
    });

    this.logger.verbose(
      `TUS server created for uploading ${allowedMimeTypes?.join(',')} ` +
        `to container '${container}'` +
        ` with max size ${maxSize}`,
    );

    return tusServer;
  }

  private attachFileInStorageToRequest(req: any, upload: Upload) {
    req['fileInStorage'] = this.mapUpload2FileInStorage(upload);
  }

  private mapUpload2FileInStorage(upload: Upload): FileInStorage {
    if (upload.storage == null) {
      throw new Error('Upload storage is not set');
    }

    if (upload.storage.bucket == null) {
      throw new Error('Upload storage bucket is not set');
    }

    return {
      container: upload.storage.bucket,
      fileName: upload.id,
    };
  }

  private validateUploadMimeTypeOrThrowTusError(upload: Upload, allowedMimeTypes?: string[]) {
    if (upload?.metadata?.filetype == null) {
      throw { status_code: 400, body: 'Upload mime type could not be determined' } as unknown as Error;
    }

    if (allowedMimeTypes == null) {
      return;
    }

    if (!allowedMimeTypes.includes(upload.metadata.filetype)) {
      throw { status_code: 415, body: `MIME type '${upload.metadata.filetype}' is not allowed` } as unknown as Error;
    }
  }
}
