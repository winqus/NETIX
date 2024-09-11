import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { createReadStream, existsSync, ReadStream } from 'fs';
import { join } from 'path';
import { Result } from '../common/Result';
import { ProcessThumbnailJobData } from './queue/processThumbnailJobData.interface';
import { THUMBNAIL_DIR, THUMBNAIL_QUEUE, THUMBNAIL_QUEUE_JOBS, thumbnailFileName } from './thumbnails.constants';

@Injectable()
export class ThumbnailsService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(@InjectQueue(THUMBNAIL_QUEUE) private readonly thumbnailQueue: Queue) {}

  async processThumbnailForTitle(titleUUID: string, file: Express.Multer.File): Promise<Result<void>> {
    this.logger.log(`Processing thumbnail (${file.originalname}) for title ${titleUUID}`);

    await this.thumbnailQueue.add(THUMBNAIL_QUEUE_JOBS.PROCESS_THUMBNAIL, {
      titleUUID: titleUUID,
      filePath: file.path,
    } as ProcessThumbnailJobData);

    return Result.ok();
  }

  async getThumbnailReadStreamByTitleID(titleID: string): Promise<Result<ReadStream>> {
    try {
      const filePath = join(THUMBNAIL_DIR, thumbnailFileName(titleID));
      if (existsSync(filePath) === false) {
        return Result.fail(`Thumbnail for title ${titleID} not found`);
      }

      const readStream = createReadStream(join(THUMBNAIL_DIR, thumbnailFileName(titleID)));

      return Result.ok(readStream);
    } catch (error) {
      this.logger.error(error);

      return Result.fail(error.message);
    }
  }
}
