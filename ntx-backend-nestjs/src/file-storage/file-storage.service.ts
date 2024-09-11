import { Inject, Injectable } from '@nestjs/common';
import { FILE_STORAGE_STRATEGY_TOKEN } from './file-storage.constants';
import { FileStorageUploadSingleFileArgs } from './file-storage.interfaces';
import { FileStorage } from './FileStorage';

@Injectable()
export class FileStorageService implements FileStorage {
  constructor(@Inject(FILE_STORAGE_STRATEGY_TOKEN) private readonly fileStorageStrategy: FileStorage) {}

  uploadSingleFile(args: FileStorageUploadSingleFileArgs): Promise<void> {
    return this.fileStorageStrategy.uploadSingleFile(args);
  }
}
