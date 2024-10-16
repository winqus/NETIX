import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { generateUniqueID } from '@ntx/common/utils/ID.utils';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { FileInStorage } from '@ntx/file-storage/types';
import { Readable } from 'stream';
import {
  BACKDROP_EXTENTION,
  BACKDROP_ID_LENGTH,
  BACKDROP_ID_PREFIX,
  IMAGES_BACKDROP_CONTAINER,
  IMAGES_CREATE_BACKDROP_JOBNAME,
  IMAGES_CREATE_BACKDROP_QUEUE,
} from './images.constants';
import { BackdropSize } from './images.types';
import { CreateBackdropQueue } from './queues/create-backdrop.types';
import { makeBackdropFileName } from './utils/images.utils';

@Injectable()
export class BackDropService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectQueue(IMAGES_CREATE_BACKDROP_QUEUE) private readonly backdropQueue: CreateBackdropQueue,
    private readonly fileStorageSrv: FileStorageService,
  ) {}

  public async addCreateBackdropJob(file: FileInStorage): Promise<string> {
    try {
      const backdropID = this.generateUUID();

      const payload = {
        file,
        backdropID,
      };
      await this.backdropQueue.add(IMAGES_CREATE_BACKDROP_JOBNAME, payload);

      return backdropID;
    } catch (error) {
      this.logger.error('Failed to create backdrop ${backdropID}: ', error.message);
      throw error;
    }
  }

  public async findOne(id: string, size: BackdropSize): Promise<Readable> {
    try {
      const fileName = makeBackdropFileName(id, size, BACKDROP_EXTENTION);
      const backdropStream = await this.fileStorageSrv.downloadStream({
        container: IMAGES_BACKDROP_CONTAINER,
        fileName: fileName,
      });

      return backdropStream;
    } catch (error) {
      this.logger.error('Failed to find backdrop ${backdropID}: ', error.message);
      throw error;
    }
  }

  protected generateUUID(): string {
    return generateUniqueID(BACKDROP_ID_PREFIX, BACKDROP_ID_LENGTH);
  }
}
