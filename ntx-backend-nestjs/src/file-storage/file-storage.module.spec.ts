import { Test, TestingModule } from '@nestjs/testing';
import { FileStorageLocal } from './file-storage-local/file-storage-local.class';
import { FILE_STORAGE_STRATEGY_TOKEN } from './file-storage.constants';
import { FileStorageModule } from './file-storage.module';
import { FileStorageService } from './file-storage.service';
import { FileStorageModuleOptions, StorageType } from './types';

describe('FileStorageModule', () => {
  describe('forRoot', () => {
    it('creates FileStorageLocal instance with options', async () => {
      const storageType = StorageType.LocalFileSystem;
      const options: Partial<FileStorageModuleOptions> = {
        [storageType]: { setup: { storageBaseDirPath: '' } },
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [FileStorageModule.forRoot(storageType, options)],
      }).compile();

      const fileStorage = module.get(FILE_STORAGE_STRATEGY_TOKEN);
      const fileStorageService = module.get(FileStorageService);

      expect(fileStorage).toBeInstanceOf(FileStorageLocal);
      expect(fileStorageService).toBeInstanceOf(FileStorageService);
    });
  });
});
