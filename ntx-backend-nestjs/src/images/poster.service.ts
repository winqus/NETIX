import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { FileInStorage } from '@ntx/file-storage/types';
import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';
import { IMAGES_CREATE_POSTER_JOBNAME, IMAGES_CREATE_POSTER_QUEUE } from './images.constants';
import { CreatePosterQueue } from './queues/create-poster.types';

@Injectable()
export class PosterService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(@InjectQueue(IMAGES_CREATE_POSTER_QUEUE) private readonly posterQueue: CreatePosterQueue) {}

  public async createPoster(file: FileInStorage): Promise<string> {
    try {
      const posterID = generateUUIDv4();

      const payload = {
        file,
        posterID,
      };
      await this.posterQueue.add(IMAGES_CREATE_POSTER_JOBNAME, payload);

      return posterID;
    } catch (error) {
      this.logger.error('Failed to create poster ${posterID}: ', error.message);
      throw error;
    }
  }
}
