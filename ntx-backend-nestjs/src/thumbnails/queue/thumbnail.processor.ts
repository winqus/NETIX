import { OnQueueEvent, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Result } from '@ntx/common/Result';
import { NtxEvent } from '@ntx/common/events';
import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';
import { Job } from 'bullmq';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as sharp from 'sharp';
import ThumbnailCreatedForTitleEvent from '../../common/events/ThumbnailCreatedEvent';
import { Thumbnail } from '../interfaces/thumbnail.interface';
import { ThumbnailCategory } from '../interfaces/thumbnailCategory.enum';
import { ThumbnailFormat } from '../interfaces/thumbnailFormat.enum';
import {
  THUMBNAIL_DIR,
  THUMBNAIL_FILE,
  THUMBNAIL_QUEUE,
  THUMBNAIL_QUEUE_CONCURRENCY,
  THUMBNAIL_QUEUE_JOBS,
  thumbnailFileName,
} from '../thumbnails.constants';
import { ThumbnailsRepository } from '../thumbnails.repository';
import { ProcessThumbnailJobData } from './processThumbnailJobData.interface';

@Processor(THUMBNAIL_QUEUE, {
  concurrency: THUMBNAIL_QUEUE_CONCURRENCY,
})
export class ThumbnailProcessor extends WorkerHost {
  private readonly logger = new Logger(ThumbnailProcessor.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly repository: ThumbnailsRepository,
  ) {
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
    const { filePath, titleUUID: titleID } = job.data;
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
    await job.updateProgress(80);

    // TODO: remove the old file after processing, this fails due to EPERM for some reason
    // await fse.removeSync(filePath);

    await job.updateProgress(90);

    const newThumbnail = await this.repository.create({
      createdAt: new Date(),
      updatedAt: new Date(),
      uuid: generateUUIDv4(),
      type: ThumbnailCategory.Normal,
      format: ThumbnailFormat.WEBP,
    } as Thumbnail);
    await job.updateProgress(95);

    this.eventEmitter.emit(
      NtxEvent.ThumbnailCreatedForTitle,
      new ThumbnailCreatedForTitleEvent(job.data.titleUUID, newThumbnail),
    );
    await job.updateProgress(100);

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
