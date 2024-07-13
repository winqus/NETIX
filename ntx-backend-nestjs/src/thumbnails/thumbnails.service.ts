import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Result } from '../common/Result';
import { ProcessThumbnailJobData } from './queue/processThumbnailJobData.interface';
import { THUMBNAIL_QUEUE, THUMBNAIL_QUEUE_JOBS } from './thumbnails.constants';

@Injectable()
export class ThumbnailsService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(@InjectQueue(THUMBNAIL_QUEUE) private readonly thumbnailQueue: Queue) {}

  async processThumbnailForTitle(titleID: string, file: Express.Multer.File): Promise<Result<void>> {
    this.logger.log(`Processing thumbnail (${file.originalname}) for title ${titleID}`);

    await this.thumbnailQueue.add(THUMBNAIL_QUEUE_JOBS.PROCESS_THUMBNAIL, {
      titleID: titleID,
      filePath: file.path,
    } as ProcessThumbnailJobData);

    return Result.ok();
  }
}
