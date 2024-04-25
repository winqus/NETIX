import { Result } from '../../core/logic/Result';

export default interface IFileService {
  saveBufferToFile(buffer: Buffer, filePath: string): Promise<Result<void>>;

  makeDirIfNotExists(dirPath: string): Promise<Result<void>>;

  fileExists(filePath: string): boolean;
}
