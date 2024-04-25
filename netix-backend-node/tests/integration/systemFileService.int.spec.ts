import fs from 'fs';
import { mock } from 'jest-mock-extended';
import os from 'os';
import path from 'path';
import { Logger } from 'winston';
import SystemFileService from '../../src/services/systemFileService';

describe('SystemFileService with real file interactions', () => {
  const mockLogger = mock<Logger>();
  const fileService = new SystemFileService(mockLogger);
  let testDirPath: string;

  beforeEach(() => {
    // Create a unique temporary directory for each test
    testDirPath = fs.mkdtempSync(path.join(os.tmpdir(), 'testData-'));
  });

  afterEach(() => {
    // Clean up - Recursively remove the temporary directory after each test
    fs.rmSync(testDirPath, { recursive: true, force: true });
  });

  it('should save a buffer to a file', async () => {
    const buffer = Buffer.from('Hello, world!');
    const filePath = path.join(testDirPath, 'testFile.txt');

    await fileService.saveBufferToFile(buffer, filePath);

    const fileExists = fs.existsSync(filePath);
    expect(fileExists).toBe(true);
    expect(fs.readFileSync(filePath).toString()).toBe('Hello, world!');
  });

  it('should create a directory if it does not exist', async () => {
    const dirPath = path.join(testDirPath, 'newDir');

    await fileService.makeDirIfNotExists(dirPath);

    expect(fs.existsSync(dirPath)).toBe(true);
  });

  it('should overwrite a file if it already exists', async () => {
    const filePath = path.join(testDirPath, 'someFile.txt');
    fs.writeFileSync(filePath, 'old data');

    const buffer = Buffer.from('new data');
    await fileService.saveBufferToFile(buffer, filePath);

    expect(fs.readFileSync(filePath).toString()).toBe('new data');
  });

  it('should check file existence correctly', () => {
    const filePath = path.join(testDirPath, 'someFile.txt');
    fs.writeFileSync(filePath, 'data');

    expect(fileService.fileExists(filePath)).toBe(true);
    expect(fileService.fileExists(path.join(testDirPath, 'nonexistent.txt'))).toBe(false);
  });
});
