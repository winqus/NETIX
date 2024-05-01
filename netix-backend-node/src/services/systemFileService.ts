import fs from 'node:fs';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { Result } from '../core/logic/Result';
import { normalizeToForwardSlash } from '../utils/normalizePath';
import IFileService from './IServices/IFileService';

@Service()
export default class SystemFileService implements IFileService {
  constructor(@Inject('logger') private logger: Logger) {}

  public async saveBufferToFile(buffer: Buffer, filePath: string): Promise<Result<void>> {
    try {
      fs.writeFileSync(filePath, buffer);
      this.logger.info(`[SystemFileService, saveBufferToFile]: File saved at ${filePath}`);

      return Result.ok();
    } catch (error) {
      this.logger.error(`[SystemFileService, saveBufferToFile]: ${error}`);

      return Result.fail(error);
    }
  }

  public async makeDirIfNotExists(dirPath: string): Promise<Result<void>> {
    try {
      if (!dirPath) {
        return Result.fail('Invalid directory path');
      }

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.logger.info(`[SystemFileService, makeDirIfNotExists]: Directory created at ${dirPath}`);
      }

      return Result.ok();
    } catch (error) {
      this.logger.error(`[SystemFileService, makeDirIfNotExists]: ${error}`);

      return Result.fail(error);
    }
  }

  public fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  public async getFileNamesInDir(dirPath: string): Promise<Result<string[]>> {
    try {
      if (!dirPath) {
        return Result.fail<string[]>('Invalid directory path');
      }

      const files = fs
        .readdirSync(dirPath, { withFileTypes: true })
        .filter((dirent) => dirent.isFile())
        .map((dirent) => dirent.name);
      this.logger.info(`[SystemFileService, getFilesInDir]: Found ${files.length} files in directory ${dirPath}`);

      return Result.ok<string[]>(files);
    } catch (error) {
      this.logger.error(`[SystemFileService, getFilesInDir]: ${error}`);

      return Result.fail<string[]>(error);
    }
  }

  public async mergeFiles(filePaths: string[], mergedFileDestinationPath: string): Promise<Result<void>> {
    try {
      const normalizedDestinationPath = normalizeToForwardSlash(mergedFileDestinationPath);

      // Check if all files exist
      for (const filePath of filePaths) {
        if (!fs.existsSync(filePath)) {
          this.logger.error(`[SystemFileService, mergeFiles]: File does not exist: ${filePath}`);

          return Result.fail(`File does not exist: ${filePath}`);
        }
      }

      // Create destination directory if it doesn't exist
      const destinationDirPath = normalizedDestinationPath.substring(0, normalizedDestinationPath.lastIndexOf('/'));
      const dirResult = await this.makeDirIfNotExists(destinationDirPath);

      if (dirResult.isFailure) {
        return Result.fail(dirResult.errorValue());
      }

      // Create write stream for merged file and write all files to it
      const writeStream = fs.createWriteStream(normalizedDestinationPath);

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          this.logger.info(`[SystemFileService, mergeFiles]: Files merged and saved at ${mergedFileDestinationPath}`);
          resolve(Result.ok());
        });

        writeStream.on('error', (error) => {
          this.logger.error(`[SystemFileService, mergeFiles]: ${error}`);
          reject(Result.fail(error));
        });

        // Write all files to the stream
        filePaths.forEach((path, index) => {
          const normalizedPath = normalizeToForwardSlash(path);
          const buffer = fs.readFileSync(normalizedPath);
          writeStream.write(buffer, (err) => {
            if (err) {
              writeStream.close();
              reject(Result.fail(err));
            }

            // Delete file after it's been written to the merged file
            fs.unlinkSync(normalizedPath);

            // If it's the last file, end the stream
            if (index === filePaths.length - 1) {
              writeStream.end();
            }
          });
        });
      });
    } catch (error) {
      this.logger.error(`[SystemFileService, mergeFiles]: ${error}`);

      return Result.fail(error);
    }
  }

  public async moveFile(sourcePath: string, destinationPath: string): Promise<Result<void>> {
    try {
      if (!fs.existsSync(sourcePath)) {
        this.logger.error(`[SystemFileService, moveFile]: Source file does not exist: ${sourcePath}`);

        return Result.fail(`Source file does not exist: ${sourcePath}`);
      }

      const destinationDirPath = destinationPath.substring(0, destinationPath.lastIndexOf('/'));
      const dirResult = await this.makeDirIfNotExists(destinationDirPath);

      if (dirResult.isFailure) {
        return Result.fail(dirResult.errorValue());
      }

      fs.renameSync(sourcePath, destinationPath);

      this.logger.info(`[SystemFileService, moveFile]: File moved from ${sourcePath} to ${destinationPath}`);

      return Result.ok();
    } catch (error) {
      this.logger.error(`[SystemFileService, moveFile]: ${error}`);

      return Result.fail(error);
    }
  }
}
