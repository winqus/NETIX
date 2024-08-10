import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Result } from '@ntx/common/Result';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import { Video } from './interfaces/video.interface';
import { VIDEO_MODEL, VIDEO_QUEUE, VIDEO_QUEUE_JOBS } from './videos.constants';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectQueue(VIDEO_QUEUE) private readonly videoQueue: Queue,
    @Inject(VIDEO_MODEL) private readonly videoModel: Model<Video>,
  ) {}

  async processVideoForTitle(titleID: string, file: Express.Multer.File): Promise<Result<void>> {
    this.logger.log(`Adding video (${file.filename}) for title ${titleID} to queue for processing`);

    await this.videoQueue.add(VIDEO_QUEUE_JOBS.PROCESS_VIDEO, {
      titleID: titleID,
      filePath: file.path,
    });

    return Result.ok();
  }
}
