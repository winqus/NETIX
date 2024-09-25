import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { FileInStorage } from '@ntx/file-storage/types';
import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';
import { Readable } from 'stream';
import { IMAGES_CREATE_POSTER_JOBNAME, IMAGES_CREATE_POSTER_QUEUE, IMAGES_POSTER_CONTAINER } from './images.constants';
import { PosterSize } from './images.types';
import { CreatePosterQueue } from './queues/create-poster.types';
import { makePosterFileName } from './utils/images.utils';

@Injectable()
export class PosterService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectQueue(IMAGES_CREATE_POSTER_QUEUE) private readonly posterQueue: CreatePosterQueue,
    private readonly fileStorageSrv: FileStorageService,
  ) {}

  public async addCreatePosterJob(file: FileInStorage): Promise<string> {
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

  public async findOne(id: string, size: PosterSize): Promise<Readable> {
    try {
      const fileName = makePosterFileName(id, size, 'webp');
      const posterStream = await this.fileStorageSrv.downloadStream({
        container: IMAGES_POSTER_CONTAINER,
        fileName: fileName,
      });

      // return this.streamToBuffer(posterStream);
      return posterStream;
    } catch (error) {
      this.logger.error('Failed to find poster ${posterID}: ', error.message);
      throw error;
    }
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }
}
