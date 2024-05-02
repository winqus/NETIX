const fs = require('fs');
import { mock } from 'jest-mock-extended';
import { Logger } from 'winston';
import SystemFileService from './SystemFileService';

describe('sysFileService', () => {
  jest.mock('fs');

  const mockLogger = mock<Logger>();

  const fileService = new SystemFileService(mockLogger);

  describe('saveBufferToFile', () => {
    const buffer = Buffer.from('test data');
    const filePath = 'path/to/file.txt';

    it('should save a buffer to a file and log the action', async () => {
      fs.writeFileSync = jest.fn();
      fs.writeFileSync.mockImplementation(() => {});

      const result = await fileService.saveBufferToFile(buffer, filePath);

      expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, buffer);
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(filePath));
      expect(result.isSuccess).toBe(true);
    });

    it('should handle and log an error if the file cannot be saved', async () => {
      fs.writeFileSync = jest.fn();
      const error = new Error('Failed to save file');
      fs.writeFileSync.mockImplementation(() => {
        throw error;
      });

      const result = await fileService.saveBufferToFile(buffer, filePath);

      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to save file'));
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe('makeDirIfNotExists', () => {
    const dirPath = 'path/to/dir';

    it('should create a directory if it does not exist', async () => {
      fs.existsSync = jest.fn();
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync = jest.fn();

      const result = await fileService.makeDirIfNotExists(dirPath);

      expect(fs.mkdirSync).toHaveBeenCalledWith(dirPath, { recursive: true });
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(dirPath));
      expect(result.isSuccess).toBe(true);
    });

    it('should not create a directory if it already exists', async () => {
      fs.existsSync = jest.fn();
      fs.existsSync.mockReturnValue(true);
      fs.mkdirSync = jest.fn();
      const result = await fileService.makeDirIfNotExists(dirPath);

      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(result.isSuccess).toBe(true);
    });

    it('should handle and log an error if the directory cannot be created', async () => {
      fs.existsSync = jest.fn();
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync = jest.fn();
      const error = new Error('Failed to create directory');
      fs.mkdirSync.mockImplementation(() => {
        throw error;
      });
      const result = await fileService.makeDirIfNotExists(dirPath);

      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to create directory'));
      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', () => {
      fs.existsSync = jest.fn();
      fs.existsSync.mockReturnValue(true);

      expect(fileService.fileExists('path/to/file.txt')).toBe(true);
    });

    it('should return false if file does not exist', () => {
      fs.existsSync = jest.fn();
      fs.existsSync.mockReturnValue(false);

      expect(fileService.fileExists('path/to/nonexistent.txt')).toBe(false);
    });
  });
});
