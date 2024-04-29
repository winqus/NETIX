import { Inject, Service } from 'typedi';
import { Logger } from 'winston';
import config from '../config';
import { Result } from '../core/logic/Result';
import { VideoChunkUploadDTO } from '../dto/videoUploadDTOs';
import IVideoUploadRequestRepository from './IRepositories/IVideoUploadRequestRepository';
import IFileService from './IServices/IFileService';
import IVideoUploadService from './IServices/IVideoUploadService';

@Service()
export default class VideoUploadService implements IVideoUploadService {
  constructor(
    @Inject('logger') private logger: Logger,
    @Inject('FileService') private fileService: IFileService,
    @Inject('VideoUploadRequestRepository') private uploadRequestService: IVideoUploadRequestRepository
  ) {}

  public async saveVideoChunkFile(videoChunkUpload: VideoChunkUploadDTO, overwrite = false): Promise<Result<void>> {
    try {
      const fileDir = `${config.video.rawUploadDir}/${videoChunkUpload.requestId}`;
      const filePath = `${fileDir}/${videoChunkUpload.videoId}_chunk-${videoChunkUpload.chunkIndex}`;

      const dirResult = await this.fileService.makeDirIfNotExists(fileDir);
      if (dirResult.isFailure) {
        this.logger.error(`[VideoUploadService]: Failed to create directory at ${fileDir}`);

        return Result.fail(dirResult.errorValue());
      }

      const fileExists = this.fileService.fileExists(filePath);
      if (fileExists && !overwrite) {
        this.logger.warn(`[VideoUploadService]: Chunk already exists: ${filePath}`);

        return Result.fail('Chunk already exists');
      }

      const chunkData = videoChunkUpload.chunkData;
      const saveResult = await this.fileService.saveBufferToFile(chunkData, filePath);
      if (saveResult.isFailure) {
        this.logger.error(`[VideoUploadService]: Failed to save chunk at ${filePath}`);

        return Result.fail(saveResult.errorValue());
      }

      this.logger.info(`[VideoUploadService]: Saved chunk: ${filePath}`);

      return Result.ok<void>();
    } catch (error) {
      this.logger.error(`[VideoUploadService]: Failed to save chunk: ${error}`);

      throw error;
    }
  }
}
