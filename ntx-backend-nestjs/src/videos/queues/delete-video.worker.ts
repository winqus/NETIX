import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { jobLogError, jobLogErrorAndThrowError } from '@ntx/utility/queueJobLogAndThrowError';
import { Job } from 'bullmq';
import { DELETE_VIDEO_QUEUE, DELETE_VIDEO_QUEUE_CONCURRENCY, VIDEO_FILE_CONTAINER } from '../videos.constants';
import { VideosRepository } from '../videos.repository';
import { DeleteVideoJob } from './delete-video.types';

@Processor(DELETE_VIDEO_QUEUE, {
  concurrency: DELETE_VIDEO_QUEUE_CONCURRENCY,
})
export class DeleteVideoWorker extends WorkerHost {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly fileStorageSrv: FileStorageService,
    private readonly videosRepository: VideosRepository,
  ) {
    super();
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(`Processing job #${job.id}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job #${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job #${job.id} failed: ${error.message}`);
  }

  async process(job: DeleteVideoJob, _token?: string): Promise<void> {
    try {
      const { videoID } = job.data;
      if (videoID == null) {
        await jobLogErrorAndThrowError(job, `Invalid job data`);
      }
      await job.updateProgress(10);

      try {
        await this.fileStorageSrv.deleteFile({
          container: VIDEO_FILE_CONTAINER,
          fileName: videoID,
        });
      } catch (error) {
        const errorMsg = `Failed to delete video file from storage: ${error.message}`;
        await jobLogError(job, errorMsg);
        this.logger.error(errorMsg);
      }
      await job.updateProgress(50);

      const isDeleted = await this.videosRepository.deleteOneByUUID(videoID);
      if (!isDeleted) {
        await jobLogErrorAndThrowError(job, `Failed to delete video from DB: ${videoID}`);
      }
      await job.updateProgress(100);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Error processing video: ${error}`);
      }
    }
  }
}
