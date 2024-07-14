import { OnQueueEvent, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bullmq';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { Result } from 'src/common/Result';
import ThumbnailCreatedEvent from '../events/ThumbnailCreatedEvent';
import {
  THUMBNAIL_CREATED_EVENT,
  THUMBNAIL_DIR,
  THUMBNAIL_FILE,
  THUMBNAIL_QUEUE,
  THUMBNAIL_QUEUE_CONCURRENCY,
  THUMBNAIL_QUEUE_JOBS,
  thumbnailFileName,
} from '../thumbnails.constants';
import { ProcessThumbnailJobData } from './processThumbnailJobData.interface';

@Processor(THUMBNAIL_QUEUE, {
  concurrency: THUMBNAIL_QUEUE_CONCURRENCY,
})
export class ThumbnailProcessor extends WorkerHost {
  private readonly logger = new Logger(ThumbnailProcessor.name);

  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async process(job: Job<any, any, string>, token?: string): Promise<any> {
    this.logger.log(`Processing ${job.id}`);

    switch (job.name) {
      case THUMBNAIL_QUEUE_JOBS.PROCESS_THUMBNAIL:
        return await this.handleThumbnailProcessing(job, token);
    }
  }

  async handleThumbnailProcessing(job: Job<ProcessThumbnailJobData>, _token?: string): Promise<Result<any>> {
    const { filePath, titleID } = job.data;
    await job.updateProgress(10);

    const outputFilePath = path.join(THUMBNAIL_DIR, thumbnailFileName(titleID));

    await sharp(filePath)
      .resize({
        width: THUMBNAIL_FILE.TARGET_WIDTH,
        height: THUMBNAIL_FILE.TARGET_HEIGHT,
        fit: sharp.fit.cover,
      })
      .webp()
      .toFile(outputFilePath);

    fs.writeFileSync(filePath.concat('.remove'), '');

    await job.updateProgress(100);

    this.eventEmitter.emit(THUMBNAIL_CREATED_EVENT, new ThumbnailCreatedEvent(job.data.titleID, job.data.titleID));

    return Result.ok(outputFilePath);
  }

  @OnQueueEvent('active')
  handleQueueActive(_job: Job) {}

  @OnWorkerEvent('active')
  handleWorkerActive(job: Job) {
    this.logger.log(`Worker active on job #${job.id}`);
  }

  @OnWorkerEvent('completed')
  handleCompleted(job: Job) {
    this.logger.log(`Completed job #${job.id}`);
  }

  @OnWorkerEvent('failed')
  handleFailed(job: Job) {
    this.logger.error(`Failed job #${job.id} due to ${job.failedReason}`);
  }
}
