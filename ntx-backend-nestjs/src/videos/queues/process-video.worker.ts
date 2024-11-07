import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { FileInStorage } from '@ntx/file-storage/types';
import { import_fileTypeStream } from '@ntx/utility/importFileType';
import { jobLogErrorAndThrowError } from '@ntx/utility/queueJobLogAndThrowError';
import { VideoState } from '../entity/video.entity';
import {
  PROCESS_VIDEO_QUEUE,
  PROCESS_VIDEO_QUEUE_CONCURRENCY,
  VIDEO_FILE_CONTAINER,
  VIDEOS_FILE_ALLOWED_MIME_TYPES,
} from '../videos.constants';
import { VideosRepository } from '../videos.repository';
import { ProcessVideoJob } from './process-video.types';

@Processor(PROCESS_VIDEO_QUEUE, {
  concurrency: PROCESS_VIDEO_QUEUE_CONCURRENCY,
})
export class ProcessVideoWorker extends WorkerHost {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly fileStorageSrv: FileStorageService,
    private readonly videosRepository: VideosRepository,
  ) {
    super();
  }

  async process(job: ProcessVideoJob, token?: string): Promise<FileInStorage> {
    this.logger.log(`Processing job #${job.id}`);

    try {
      const result = await this.handleProcessVideoJob(job, token);

      return result;
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }

  async handleProcessVideoJob(job: ProcessVideoJob, _token?: string): Promise<FileInStorage> {
    try {
      const { videoID, file } = job.data;
      if (videoID == null || file == null) {
        await jobLogErrorAndThrowError(job, `Invalid job data`);
      }

      await this.videosRepository.updateOneByUUID(videoID, { state: VideoState.PROCESSING });
      await job.updateProgress(10);

      const rawVideoReadStreamForTypeCheck = await this.fileStorageSrv.downloadStream({
        container: file.container,
        fileName: file.fileName,
      });
      await job.updateProgress(20);

      const fileTypeStream = await import_fileTypeStream();
      const { fileType } = await fileTypeStream(rawVideoReadStreamForTypeCheck);
      if (fileType == null) {
        rawVideoReadStreamForTypeCheck.destroy();
        await jobLogErrorAndThrowError(job, `Could not determine file type for video: ${videoID}`);
      } else if (!VIDEOS_FILE_ALLOWED_MIME_TYPES.includes(fileType.mime)) {
        rawVideoReadStreamForTypeCheck.destroy();
        await jobLogErrorAndThrowError(job, `Invalid mime type ${fileType.mime} for video: ${videoID}`);
      }
      await job.updateProgress(30);

      const rawVideoFileReadStream = await this.fileStorageSrv.downloadStream({
        container: file.container,
        fileName: file.fileName,
      });
      await job.updateProgress(40);

      const destinationFile: FileInStorage = {
        container: VIDEO_FILE_CONTAINER,
        fileName: videoID,
      };
      const videoFileUploadStream = await this.fileStorageSrv.uploadStream(destinationFile);
      await job.updateProgress(60);

      await new Promise((resolve, reject) => {
        rawVideoFileReadStream.pipe(videoFileUploadStream).on('done', (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        });
      });
      await job.updateProgress(80);

      const updatedVideo = await this.videosRepository.updateOneByUUID(videoID, { state: VideoState.READY });
      if (updatedVideo == null) {
        await jobLogErrorAndThrowError(job, `Failed to update video state for video: ${videoID}`);
      }
      await job.updateProgress(100);

      this.logger.log(`Video(${updatedVideo?.uuid}) proceseed and stored in '${VIDEO_FILE_CONTAINER}' container`);

      return destinationFile;
    } catch (error) {
      this.logger.error(`Failed to process video: ${error.message}`);

      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Error processing video: ${error}`);
      }
    }
  }
}
