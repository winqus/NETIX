import fs from 'node:fs';
import path from 'node:path';
import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import config from '../config';
import { NAMES } from '../config/dependencies';
import { Result } from '../core/logic/Result';
import { import_FileTypeFromFile } from '../helpers/importFileType';
import IFileService from './IServices/IFileService';

interface MergedFile {
  filePath: string;
  fileName: string;
  fileExtension: string;
  fileSize: number;
  fileMimeType: string;
}

export interface IRawUploadFileService {
  mergeFileChunksIntoVideoFile(uploadID: string, uploadDir?: string): Promise<Result<MergedFile>>;
}

@Service()
export default class RawUploadFileService implements IRawUploadFileService {
  constructor(
    @Inject(NAMES.Logger) private logger: Logger,
    @Inject(NAMES.SERVICES.SystemFile) private systemFileService: IFileService
  ) {}

  public async mergeFileChunksIntoVideoFile(uploadID: string, uploadDir?: string): Promise<Result<MergedFile>> {
    try {
      const uploadDirPath = this.constructUploadDirPath(uploadID, uploadDir);

      const fileNames = await this.fetchAndFilterFileNames(uploadID, uploadDirPath);
      if (fileNames.length === 0) {
        throw new Error(`No file chunks found in directory ${uploadDirPath}.`);
      }

      const mergeResult = await this.mergeChunks(fileNames, uploadDirPath, uploadID);
      if (mergeResult.isFailure) {
        throw new Error(`Failed to merge chunks into whole file for uploadID ${uploadID}.`);
      }

      const mergedFilePath = path.join(uploadDirPath, `${uploadID}_merged`);

      const fileTypeResult = await this.getFileType(mergedFilePath);
      if (!fileTypeResult) {
        return Result.fail(`Cannot determine file type for merged file.`);
      }

      if (!config.video.allowedMimeTypes.includes(fileTypeResult.mime)) {
        return Result.fail(`Video file has invalid mime type: ${fileTypeResult.mime}.`);
      }

      const { mime, ext } = fileTypeResult;
      const finalFileName = `${uploadID}.${ext}`;
      const finalFilePath = path.join(uploadDirPath, finalFileName);
      fs.renameSync(mergedFilePath, finalFilePath);

      const mergedFile = this.createMergedFileInfo(finalFilePath, finalFileName, mime);

      return Result.ok(mergedFile);
    } catch (error) {
      this.logger.error(`[RawUploadFileService, mergeFileChunksIntoVideoFile] Failed to merge upload (${uploadID}): ${error}`);

      return Result.fail(`Failed to merge file chunks into video file for uploadID ${uploadID}.`);
    }
  }

  private async getFileType(filePath: string): Promise<{ mime: string; ext: string } | undefined> {
    const fileTypeFromFile = await import_FileTypeFromFile();
    const data = await fileTypeFromFile(filePath);

    return data;
  }

  private createMergedFileInfo(filePath: string, fileName: string, mimeType: string): MergedFile {
    const fileExtension = path.extname(filePath);
    const fileSize = fs.statSync(filePath).size;

    return {
      filePath,
      fileName,
      fileExtension,
      fileSize,
      fileMimeType: mimeType,
    };
  }

  private async fetchAndFilterFileNames(uploadID: string, uploadDirPath: string): Promise<string[]> {
    const fileNamesInDir = await this.systemFileService.getFileNamesInDir(uploadDirPath);
    if (fileNamesInDir.isFailure) {
      throw new Error(`Failed to get file names in directory ${uploadDirPath}.`);
    }

    const chunkRegex = new RegExp(`^${uploadID}_chunk-[0-9]+$`);

    return fileNamesInDir.getValue().filter((fileName) => fileName.match(chunkRegex));
  }

  private async mergeChunks(fileNames: string[], uploadDirPath: string, uploadID: string): Promise<Result<void>> {
    const filePaths = fileNames.map((fileName) => path.join(uploadDirPath, fileName));

    return await this.systemFileService.mergeFiles(filePaths, path.join(uploadDirPath, `${uploadID}_merged`));
  }

  private constructUploadDirPath(uploadID: string, uploadDir?: string): string {
    const rawUploadDirPath = uploadDir || config.video.rawUploadDir;

    return path.join(rawUploadDirPath, uploadID);
  }
}
