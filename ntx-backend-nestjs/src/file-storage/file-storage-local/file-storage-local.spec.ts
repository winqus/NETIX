import { Test, TestingModule } from '@nestjs/testing';
import * as assert from 'assert';
import * as fse from 'fs-extra';
import { resolve, sep } from 'path';
import { once, Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { INVALID_FILE_NAME } from '../file-storage.constants';
import { FileStorageModule } from '../file-storage.module';
import { FileStorageService } from '../file-storage.service';
import { FileStorage } from '../FileStorage';
import { StorageType } from '../types';
import { generateRandomFileName } from '../utils/name.utils';

const tempStoragePath = resolve('.temp-store-' + Date.now());

const { storageType, options } = {
  storageType: StorageType.LocalFileSystem,
  options: {
    [StorageType.LocalFileSystem]: { setup: { storageBaseDirPath: tempStoragePath } },
  },
};

async function createRandomTempFile(fileStorage: FileStorage, container: string, fileContents: string) {
  const content = Buffer.from(fileContents);
  const fileName = await generateRandomFileName();

  await fileStorage.uploadSingleFile({ container, fileName, content });

  return fileName;
}

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
    fse.rm(tempStoragePath, { recursive: true });
  });

  describe('uploadSingleFile', () => {
    it('uploads single file to container1', async () => {
      const content = Buffer.from('abc-test-file-contents');
      const container = 'containter1';
      const fileName = 'temp-file-name-1.txt';
      const expectedFilePath = resolve(tempStoragePath, container, fileName);

      await fileStorageSrv.uploadSingleFile({ container, fileName, content });

      const fileExists = fse.existsSync(expectedFilePath);
      expect(fileExists).toBe(true);
    });
  });

  describe('uploadStream', () => {
    it('uploads stream to container2.uploads', async () => {
      const content = Buffer.from('abc-test-streamed-file-contents');
      const container = 'containter2.uploads';
      const fileName = 'temp-streamed-file.txt';
      const expectedFilePath = resolve(tempStoragePath, container.replaceAll('.', sep), fileName);

      const upload = await fileStorageSrv.uploadStream({ container, fileName });
      const entry = Readable.from(content);
      const abortCtrl = new AbortController();
      const timeout = setTimeout(() => abortCtrl.abort(), 1000);
      const listener = once(upload, 'done', { signal: abortCtrl.signal }).finally(() => clearTimeout(timeout));
      await pipeline(entry, upload);
      await listener;

      const fileExists = fse.existsSync(expectedFilePath);
      expect(fileExists).toBe(true);
    });
  });

  describe('deleteFile', () => {
    it('deletes existing file', async () => {
      const container = 'container-del';
      const fileName = await createRandomTempFile(fileStorageSrv, container, 'contents-for-deletion');
      const filePath = resolve(tempStoragePath, container, fileName);
      assert(fse.existsSync(filePath));

      await fileStorageSrv.deleteFile({ container, fileName });

      const fileExists = fse.existsSync(filePath);
      expect(fileExists).toBe(false);
    });

    it('throws error when trying to delete with empty fileName', async () => {
      const container = 'container-del';
      const fileName = '';

      const promise = fileStorageSrv.deleteFile({ container, fileName });

      await expect(promise).rejects.toThrow(INVALID_FILE_NAME);
    });
  });
});
