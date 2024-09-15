import { CallHandler, ExecutionContext, Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { generateTempFileName } from '@ntx/utility/fileNameUtils';
import multerFileMimeTypeFilter from '@ntx/utility/multerFileMimeTypeFilter';
import { extname } from 'path';
import { FileStorageService } from '../file-storage.service';
import FileStorageEngine from '../multer/FileStorageEngine.multer';

export type FileToStorageContainerInterceptorArgs = {
  field: string;
  container: string;
  maxSize: number;
  allowedMimeTypes?: string[];
};

export function FileToStorageContainerInterceptor({
  field,
  container,
  maxSize,
  allowedMimeTypes,
}: FileToStorageContainerInterceptorArgs): Type<NestInterceptor> {
  @Injectable()
  class MixinFileToStorageContainerInterceptor implements NestInterceptor {
    private readonly multerInterceptor: NestInterceptor;

    constructor(private readonly fileStorageSrv: FileStorageService) {
      const multerOptions = {
        storage: FileStorageEngine({
          destinationContainer: container,
          fileStorage: fileStorageSrv,
          filename: (_req, file, cb) => {
            const fileName = generateTempFileName({ prefix: file.fieldname, ext: extname(file.originalname) });
            cb(null, fileName);
          },
        }),
        limits: {
          fileSize: maxSize,
        },
        fileFilter: (_req: any, _file: any, cb: any) => {
          cb(null, true);
        },
      };

      if (allowedMimeTypes) {
        multerOptions.fileFilter = multerFileMimeTypeFilter(allowedMimeTypes);
      }

      this.multerInterceptor = new (FileInterceptor(field, multerOptions))();
    }

    intercept(context: ExecutionContext, next: CallHandler) {
      return this.multerInterceptor.intercept(context, next);
    }
  }

  return mixin(MixinFileToStorageContainerInterceptor);
}
