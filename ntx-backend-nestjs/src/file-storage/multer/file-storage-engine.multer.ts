import { Request } from 'express';
import { FileStorage } from '../file-storage.abstract';
import { FileInStorage } from '../types';
import { generateRandomFileName } from '../utils/name.utils';

export interface FileStorageEngineOptions {
  destinationContainer: string;
  fileStorage: FileStorage;
  filename?(req: Request, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void): void;
}

function getFilename(_req: Request, _file: Express.Multer.File, cb: any) {
  generateRandomFileName()
    .then((fileName) => cb(null, fileName))
    .catch((err) => cb(err));
}

function FileStorageEngine(opts: FileStorageEngineOptions) {
  const { destinationContainer, fileStorage, filename } = opts;
  if (destinationContainer == null || fileStorage == null) {
    throw new Error('Invalid opts for FileStorageEngine');
  }

  this.getFilename = filename || getFilename;
  this.fileStorage = fileStorage;

  this.getDestinationContainer = function (_req: any, _file: any, cb: any) {
    cb(null, destinationContainer);
  };
}

FileStorageEngine.prototype._handleFile = function _handleFile(req: Request, file: Express.Multer.File, cb: any) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const thisEngine = this;

  thisEngine.getDestinationContainer(req, file, function (err: any, destContainer: string) {
    if (err) {
      return cb(err);
    }

    thisEngine.getFilename(req, file, function (err: any, filename: string) {
      if (err) {
        return cb(err);
      }

      (thisEngine.fileStorage as FileStorage)
        .uploadStream({
          container: destContainer,
          fileName: filename,
        })
        .then((uploadStream) => {
          file.stream.pipe(uploadStream);
          uploadStream.on('done', function () {
            cb(null, {
              container: destContainer,
              fileName: filename,
            });
          });
        })
        .catch((error) => cb(error));
    });
  });
};

FileStorageEngine.prototype._removeFile = function _removeFile(_req: Request, file: FileInStorage, cb: any) {
  const { container, fileName } = file;

  (this.fileStorage as FileStorage)
    .deleteFile({ container, fileName })
    .then(() => cb(null))
    .catch((err) => cb(err));
};

export default function (opts: FileStorageEngineOptions) {
  return new (FileStorageEngine as any)(opts);
}
