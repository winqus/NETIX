import fs from 'fs';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import { Result } from '../core/logic/Result';
import IFileService from './IServices/IFileService';

@Service()
export default class SystemFileService implements IFileService {
  constructor(@Inject('logger') private logger: Logger) {}

  public async saveBufferToFile(buffer: Buffer, filePath: string): Promise<Result<void>> {
    try {
      fs.writeFileSync(filePath, buffer);
      this.logger.info(`[SystemFileService]: File saved at ${filePath}`);

      return Result.ok<void>();
    } catch (error) {
      this.logger.error(`[SystemFileService]: ${error}`);

      return Result.fail(error);
    }
  }

  public async makeDirIfNotExists(dirPath: string): Promise<Result<void>> {
    try {
      if (!dirPath) {
        return Result.fail<void>('Invalid directory path');
      }

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.logger.info(`[SystemFileService]: Directory created at ${dirPath}`);
      }

      return Result.ok<void>();
    } catch (error) {
      this.logger.error(`[SystemFileService]: ${error}`);

      return Result.fail<void>(error);
    }
  }

  public fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
}
