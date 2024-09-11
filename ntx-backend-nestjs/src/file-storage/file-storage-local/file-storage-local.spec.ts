import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { resolve } from 'path';
import { FileStorageModule } from '../file-storage.module';
import { FileStorageService } from '../file-storage.service';
import { StorageType } from '../types';

const tempStoragePath = resolve('.temp-store');

const { storageType, options } = {
  storageType: StorageType.LocalFileSystem,
  options: {
    [StorageType.LocalFileSystem]: { setup: { storageBaseDirPath: tempStoragePath } },
  },
};

describe('FileStorageLocal', () => {
  let fileStorageSrv: FileStorageService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [FileStorageModule.forRoot(storageType, options)],
    }).compile();

    fileStorageSrv = module.get(FileStorageService);

    await fse.ensureDir(tempStoragePath);
  });

  afterAll(async () => {
    fse.rmdirSync(tempStoragePath, { recursive: true });
  });

  describe('uploadSingleFile', () => {
    it('uploads single file to container1', async () => {
      const content = Buffer.from('abc-test-file');
      const container = 'containter1';
      const fileName = 'temp-file-name-1.txt';
      const expectedFilePath = resolve(tempStoragePath, container, fileName);

      await fileStorageSrv.uploadSingleFile({ container, fileName, content });

      const fileExists = fse.existsSync(expectedFilePath);
      expect(fileExists).toBe(true);
    });
  });
});
