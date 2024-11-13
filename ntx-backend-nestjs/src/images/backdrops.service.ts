import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { generateUniqueID } from '@ntx/common/utils/ID.utils';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { FileInStorage } from '@ntx/file-storage/types';
import { Readable } from 'stream';
import {
  BACKDROP_EXTENTION,
  BACKDROP_FILE_CONTAINER,
  BACKDROP_ID_LENGTH,
  BACKDROP_ID_PREFIX,
  CREATE_BACKDROP_JOBNAME,
  CREATE_BACKDROP_QUEUE,
} from './images.constants';
import { BackdropSize } from './images.types';
import { CreateBackdropQueue } from './queues/create-backdrop.types';
import { makeBackdropFileName } from './utils/images.utils';

@Injectable()
export class BackdropsService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectQueue(CREATE_BACKDROP_QUEUE) private readonly backdropQueue: CreateBackdropQueue,
    private readonly fileStorageSrv: FileStorageService,
  ) {}

  public async addCreateBackdropJob(file: FileInStorage): Promise<string> {
    try {
      const backdropID = this.generateUUID();

      const payload = {
        file,
        backdropID,
      };
      await this.backdropQueue.add(CREATE_BACKDROP_JOBNAME, payload);

      return backdropID;
    } catch (error) {
      this.logger.error(`Failed to create backdrop ${error.message}`);
      throw error;
    }
  }

  public async findOne(id: string, size: BackdropSize): Promise<Readable> {
    try {
      const fileName = makeBackdropFileName(id, size, BACKDROP_EXTENTION);
      try {
        const backdropStream = await this.fileStorageSrv.downloadStream({
          container: BACKDROP_FILE_CONTAINER,
          fileName: fileName,
        });

        return backdropStream;
      } catch (error) {
        if (error.message === 'ENOENT: File does not exist') {
          this.logger.warn(`Did not find backdrop ${fileName}`);
          throw new NotFoundException('Backdrop not found');
        } else {
          this.logger.error(`Failed to find backdrop ${fileName}: `, error.message);
          throw error;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  public async deleteOne(backdropID: string): Promise<void> {
    const sizes = Object.values(BackdropSize);
    const deletePromises = sizes.map(async (size) => {
      const fileName = makeBackdropFileName(backdropID, size, BACKDROP_EXTENTION);

      try {
        const isDeleted = await this.fileStorageSrv.deleteFile({
          container: BACKDROP_FILE_CONTAINER,
          fileName: fileName,
        });

        if (isDeleted) {
          this.logger.log(`Deleted backdrop size ${size} with filename ${fileName}`);
        } else {
          this.logger.warn(`Backdrop size ${size} with filename ${fileName} was not found for deletion.`);
        }
      } catch (error) {
        if (error.message === 'ENOENT: File does not exist') {
          this.logger.warn(`Did not find backdrop ${fileName} for deletion.`);
        } else {
          this.logger.error(`Failed to delete backdrop ${fileName}: ${error.message}`);
          throw error;
        }
      }
    });

    await Promise.all(deletePromises);

    this.logger.log(`Completed deletion of all backdrop sizes for backdropID ${backdropID}`);
  }

  protected generateUUID(): string {
    return generateUniqueID(BACKDROP_ID_PREFIX, BACKDROP_ID_LENGTH);
  }
}
