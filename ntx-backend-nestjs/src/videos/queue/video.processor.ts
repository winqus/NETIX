import { OnQueueEvent, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NtxEvent } from '@ntx/common/events';
import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';
import { Job } from 'bullmq';
import * as fse from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { Result } from '../../common/Result';
import { import_FileTypeFromFile } from '../../utility/importFileType';
import { jobLogErrorAndThrowError, jobLogWithTimestamp } from '../../utility/queueJobLogAndThrowError';
import { Video } from '../interfaces/video.interface';
import { VIDEO_DIR, VIDEO_FILE, VIDEO_QUEUE, VIDEO_QUEUE_CONCURRENCY, VIDEO_QUEUE_JOBS } from '../videos.constants';
import { VideosRepository } from '../videos.repository';
import { ProcessVideoJobData } from './processVideoJobData.interface';

@Processor(VIDEO_QUEUE, {
  concurrency: VIDEO_QUEUE_CONCURRENCY,
})
export class VideoProcessor extends WorkerHost {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly repository: VideosRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>, token?: string): Promise<any> {
    switch (job.name) {
      case VIDEO_QUEUE_JOBS.PROCESS_VIDEO:
        return await this.handleVideoProcessing(job, token);
    }
  }

  async handleVideoProcessing(job: Job<ProcessVideoJobData>, _token?: string): Promise<Result<any>> {
    const { filePath, titleUUID } = job.data;

    if (
      typeof filePath !== 'string' ||
      typeof titleUUID !== 'string' ||
      titleUUID.length === 0 ||
      filePath.length === 0
    ) {
      await jobLogErrorAndThrowError(job, 'Invalid job data');
    } else if (fse.pathExistsSync(filePath) === false) {
      await jobLogErrorAndThrowError(job, `File not found at ${filePath}`);
    }

    await job.updateProgress(10);
    await jobLogWithTimestamp(job, `Processing video for title ${titleUUID}, file path: ${filePath}`);

    const fileTypeFromFile = await import_FileTypeFromFile();
    await fileTypeFromFile(filePath)
      .then(async (type) => {
        if (type == null) {
          throw new Error('File type not detected');
        } else if (VIDEO_FILE.INPUT_MIME_TYPES.includes(type.mime) === false) {
          throw new Error(`Invalid file type ${type.mime}`);
        } else if (type.ext !== VIDEO_FILE.EXTENTION) {
          throw new Error(`Invalid file extension ${type.ext}`);
        }

        await jobLogWithTimestamp(job, `File type (${type.mime}) and extension (${type.ext}) validated`);
        await job.updateProgress(20);
      })
      .catch((error) => {
        throw error;
      });

    const newVideoID = uuidv4();

    const destinationPath = VIDEO_DIR.concat(newVideoID).concat('.', VIDEO_FILE.EXTENTION);
    fse.moveSync(filePath, destinationPath, { overwrite: false });
    await job.updateProgress(50);
    await jobLogWithTimestamp(job, `Moved file to ${destinationPath}`);

    await job.updateProgress(100);
    await jobLogWithTimestamp(job, 'Video processing complete');

    const newVideo = await this.repository.create({
      uuid: generateUUIDv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Video);

    // this.eventEmitter.emit(NtxEvent.VideoCreatedForTitle, new VideoCreatedForTitleEvent(titleUUID, newVideo));

    this.logger.log(`Video processing complete for title ${titleUUID}, new video ID: ${newVideo.uuid}`);

    return Result.ok(newVideo);
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
