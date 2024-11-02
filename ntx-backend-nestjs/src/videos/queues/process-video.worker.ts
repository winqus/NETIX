import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { FileInStorage } from '@ntx/file-storage/types';
import { VideoState } from '../entity/video.entity';
import { PROCESS_VIDEO_QUEUE, PROCESS_VIDEO_QUEUE_CONCURRENCY, VIDEO_FILE_CONTAINER } from '../videos.constants';
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

      await this.videosRepository.updateOneByUUID(videoID, { state: VideoState.PROCESSING });

      await job.updateProgress(10);

      const downloadStream = await this.fileStorageSrv.downloadStream({
        container: file.container,
        fileName: file.fileName,
      });

      await job.updateProgress(20);

      // FIXME: fix check mime type
      // const passThroughStream = new PassThrough();
      // downloadStream.pipe(passThroughStream);

      // const fileTypeStream = await import_fileTypeStream();
      // const { fileType } = await fileTypeStream(passThroughStream);
      // if (fileType == null) {
      //   jobLogErrorAndThrowError(job, `Could not determine file type for video: ${videoID}`);
      // }

      // if (!VIDEOS_FILE_ALLOWED_MIME_TYPES.includes(fileType!.mime)) {
      //   jobLogErrorAndThrowError(job, `Invalid mime type ${fileType!.mime} for video: ${videoID}`);
      // }

      await job.updateProgress(40);

      const destinationFile: FileInStorage = {
        container: VIDEO_FILE_CONTAINER,
        fileName: videoID,
      };

      const uploadStream = await this.fileStorageSrv.uploadStream(destinationFile);

      await job.updateProgress(60);

      await new Promise((resolve, reject) => {
        downloadStream.pipe(uploadStream).on('done', (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        });
      });

      await job.updateProgress(80);

      await this.videosRepository.updateOneByUUID(videoID, { state: VideoState.READY });

      await job.updateProgress(100);

      this.logger.log(`File stored with name: ${videoID} in ${VIDEO_FILE_CONTAINER}`);

      return destinationFile;
    } catch (error) {
      this.logger.error(`Failed to process video: ${error.message}`);
      throw error;
    }
  }
}
