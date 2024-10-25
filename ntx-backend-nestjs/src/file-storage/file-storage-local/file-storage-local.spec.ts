import { Test, TestingModule } from '@nestjs/testing';
import * as assert from 'assert';
import * as fse from 'fs-extra';
import { resolve, sep } from 'path';
import { once, Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { FileStorage } from '../file-storage.abstract';
import { INVALID_FILE_NAME } from '../file-storage.constants';
import { FileStorageModule } from '../file-storage.module';
import { FileStorageService } from '../file-storage.service';
import { StorageType } from '../types';
import { generateRandomFileName } from '../utils/name.utils';

const tempStoragePath = resolve('.temp-test-data-store' + Date.now());

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

  const filePath = resolve(tempStoragePath, container.replaceAll('.', sep), fileName);
  assert(fse.existsSync(filePath));

  return { fileName, filePath };
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
    await fse.rm(tempStoragePath, { recursive: true });
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
      const { fileName, filePath } = await createRandomTempFile(fileStorageSrv, container, 'contents-for-deletion');

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

  describe('downloadFile', () => {
    it('downloads and existing file when valid args provided', async () => {
      const container = 'container.with-some-file';
      const expectedContents = 'some-random-contents';
      const { fileName } = await createRandomTempFile(fileStorageSrv, container, expectedContents);

      const downloadedFileBuffer = await fileStorageSrv.downloadFile({ container, fileName });

      expect(downloadedFileBuffer.toString()).toBe(expectedContents);
    });

    it('should throw an error when non existing fileName is provided', async () => {
      const container = 'container-with-file';
      await createRandomTempFile(fileStorageSrv, container, 'some-random-contents2');
      const nonExistingFileName = `some-non-existing-file-${Date.now()}`;

      const promise = fileStorageSrv.downloadFile({ container, fileName: nonExistingFileName });

      expect(promise).rejects.toThrow(/ENOENT/);
    });
  });

  describe('downloadStream', () => {
    it('downloads stream of an existing file', async () => {
      const container = 'container.with-streamed-file';
      const expectedContents = 'some-random-streamed-contents';
      const { fileName } = await createRandomTempFile(fileStorageSrv, container, expectedContents);

      const downloadedStream = await fileStorageSrv.downloadStream({ container, fileName });
      const chunks: Buffer[] = [];
      downloadedStream.on('data', (chunk) => chunks.push(chunk));
      downloadedStream.on('end', () => {
        const downloadedContents = Buffer.concat(chunks).toString();
        expect(downloadedContents).toBe(expectedContents);
      });
    });

    it('should throw an error when non existing fileName is provided', async () => {
      const container = 'container-with-streamed-file';
      await createRandomTempFile(fileStorageSrv, container, 'some-random-contents2');
      const nonExistingFileName = `some-non-existing-file-${Date.now()}`;

      const promise = fileStorageSrv.downloadStream({ container, fileName: nonExistingFileName });

      expect(promise).rejects.toThrow(/ENOENT/);
    });
  });

  describe('getFileMetadata', () => {
    it('gets metadata of an existing file', async () => {
      const container = 'container.with-metadata';
      const expectedContents = 'some-random-contents';
      const { fileName, filePath } = await createRandomTempFile(fileStorageSrv, container, expectedContents);

      const metadata = await fileStorageSrv.getFileMetadata({ container, fileName });

      expect(metadata).toMatchObject({
        size: fse.statSync(filePath).size,
      });
    });

    it('should throw an error when non existing fileName is provided', async () => {
      const container = 'container-with-metadata';
      await createRandomTempFile(fileStorageSrv, container, 'some-random-contents2');
      const nonExistingFileName = `some-non-existing-file-${Date.now()}`;

      const promise = fileStorageSrv.getFileMetadata({ container, fileName: nonExistingFileName });

      expect(promise).rejects.toThrow(/ENOENT/);
    });
  });

  describe('listFiles', () => {
    it('lists files in a container', async () => {
      const container = 'container-with-files';
      const expectedFileCount = 3;
      for (let i = 0; i < expectedFileCount; i++) {
        await createRandomTempFile(fileStorageSrv, container, `contents-${i}`);
      }

      const files = await fileStorageSrv.listFiles({ container });
      expect(files).toHaveLength(expectedFileCount);
    });

    it('should return empty array when no files in the container', async () => {
      const container = 'container-without-files';
      await fse.ensureDir(resolve(tempStoragePath, container));

      const files = await fileStorageSrv.listFiles({ container });

      expect(files).toEqual([]);
    });

    it('should return empty array when container does not exist', async () => {
      const container = 'non-existing-container';

      const files = await fileStorageSrv.listFiles({ container });

      expect(files).toEqual([]);
    });
  });
});
