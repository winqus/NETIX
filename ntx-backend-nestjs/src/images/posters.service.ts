import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { generateUniqueID } from '@ntx/common/utils/ID.utils';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { FileInStorage } from '@ntx/file-storage/types';
import { Readable } from 'stream';
import {
  CREATE_POSTER_JOBNAME,
  CREATE_POSTER_QUEUE,
  POSTER_EXTENTION,
  POSTER_FILE_CONTAINER,
  POSTER_ID_LENGTH,
  POSTER_ID_PREFIX,
} from './images.constants';
import { PosterSize } from './images.types';
import { CreatePosterQueue } from './queues/create-poster.types';
import { makePosterFileName } from './utils/images.utils';

@Injectable()
export class PostersService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectQueue(CREATE_POSTER_QUEUE) private readonly posterQueue: CreatePosterQueue,
    private readonly fileStorageSrv: FileStorageService,
  ) {}

  public async addCreatePosterJob(file: FileInStorage): Promise<string> {
    try {
      const posterID = this.generateUUID();

      const payload = {
        file,
        posterID,
      };
      await this.posterQueue.add(CREATE_POSTER_JOBNAME, payload);

      return posterID;
    } catch (error) {
      this.logger.error('Failed to create poster ${posterID}: ', error.message);
      throw error;
    }
  }

  public async findOne(id: string, size: PosterSize): Promise<Readable> {
    try {
      const fileName = makePosterFileName(id, size, POSTER_EXTENTION);
      try {
        const posterStream = await this.fileStorageSrv.downloadStream({
          container: POSTER_FILE_CONTAINER,
          fileName: fileName,
        });

        return posterStream;
      } catch (error) {
        if (error.message === 'ENOENT: File does not exist') {
          this.logger.warn(`Did not find poster ${fileName}`);
          throw new NotFoundException('Poster not found');
        } else {
          this.logger.error(`Failed to find poster ${fileName}: `, error.message);
          throw error;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  public async deleteOne(posterID: string): Promise<void> {
    const sizes = Object.values(PosterSize);
    const deletePromises = sizes.map(async (size) => {
      const fileName = makePosterFileName(posterID, size, POSTER_EXTENTION);

      try {
        const isDeleted = await this.fileStorageSrv.deleteFile({
          container: POSTER_FILE_CONTAINER,
          fileName: fileName,
        });

        if (isDeleted) {
          this.logger.log(`Deleted poster size ${size} with filename ${fileName}`);
        } else {
          this.logger.warn(`Poster size ${size} with filename ${fileName} was not found for deletion.`);
        }
      } catch (error) {
        if (error.message === 'ENOENT: File does not exist') {
          this.logger.warn(`Did not find poster ${fileName} for deletion.`);
        } else {
          this.logger.error(`Failed to delete poster ${fileName}: ${error.message}`);
          throw error;
        }
      }
    });

    await Promise.all(deletePromises);

    this.logger.log(`Completed deletion of all poster sizes for posterID ${posterID}`);
  }

  protected generateUUID(): string {
    return generateUniqueID(POSTER_ID_PREFIX, POSTER_ID_LENGTH);
  }
}
