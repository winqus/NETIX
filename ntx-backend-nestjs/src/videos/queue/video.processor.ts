import { OnQueueEvent, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bullmq';
import * as fs from 'fs';
import { Result } from 'src/common/Result';
import VideoCreatedEvent from '../events/VideoCreatedEvent';
import { VIDEO_CREATED_EVENT, VIDEO_QUEUE, VIDEO_QUEUE_CONCURRENCY, VIDEO_QUEUE_JOBS } from '../videos.constants';
import { ProcessVideoJobData } from './processVideoJobData.interface';

@Processor(VIDEO_QUEUE, {
  concurrency: VIDEO_QUEUE_CONCURRENCY,
})
export class VideoProcessor extends WorkerHost {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async process(job: Job<any, any, string>, token?: string): Promise<any> {
    switch (job.name) {
      case VIDEO_QUEUE_JOBS.PROCESS_VIDEO:
        return await this.handleVideoProcessing(job, token);
    }
  }

  async handleVideoProcessing(job: Job<ProcessVideoJobData>, _token?: string): Promise<Result<any>> {
    const { filePath } = job.data;
    await job.updateProgress(10);

    fs.writeFileSync(filePath.concat('.remove'), '');

    await job.updateProgress(100);

    this.eventEmitter.emit(VIDEO_CREATED_EVENT, new VideoCreatedEvent(job.data.titleID, job.data.titleID));

    return Result.ok();
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
