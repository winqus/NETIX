import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { FileInStorage } from '@ntx/file-storage/types';
import * as sharp from 'sharp';
import {
  BACKDROP_EXTENTION,
  IMAGES_BACKDROP_CONTAINER,
  IMAGES_BACKDROP_QUEUE_CONCURRENCY,
  IMAGES_BACKDROP_SIZES,
  IMAGES_CREATE_BACKDROP_QUEUE,
} from '../images.constants';
import { BackdropSize } from '../images.types';
import { makeBackdropFileName } from '../utils/images.utils';
import { CreateBackdropJob } from './create-backdrop.types';

@Processor(IMAGES_CREATE_BACKDROP_QUEUE, {
  concurrency: IMAGES_BACKDROP_QUEUE_CONCURRENCY,
})
export class CreateBackdropWorker extends WorkerHost {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly fileStorageSrv: FileStorageService) {
    super();
  }

  async process(job: CreateBackdropJob, token?: string): Promise<FileInStorage[]> {
    this.logger.log(`Processing job #${job.id}`);

    try {
      const result = await this.handleCreateBackdropJob(job, token);

      return result;
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }

  async handleCreateBackdropJob(job: CreateBackdropJob, _token?: string): Promise<FileInStorage[]> {
    const { backdropID, file } = job.data;
    const sizes = Object.values(BackdropSize);
    const totalSizes = sizes.length;
    let processedSizes = 0;

    const outputFiles: FileInStorage[] = [];

    const processingPromises = sizes.map(async (size) => {
      const { width, height } = IMAGES_BACKDROP_SIZES[size];

      try {
        const resizer = sharp()
          .resize({
            width: width,
            height: height,
            fit: sharp.fit.cover,
          })
          .webp();

        const downloadStream = await this.fileStorageSrv.downloadStream({
          container: file.container,
          fileName: file.fileName,
        });

        const storageDestination: FileInStorage = {
          container: IMAGES_BACKDROP_CONTAINER,
          fileName: makeBackdropFileName(backdropID, size, BACKDROP_EXTENTION),
        };

        const uploadStream = await this.fileStorageSrv.uploadStream(storageDestination);

        await new Promise<void>((resolve, reject) => {
          downloadStream
            .pipe(resizer)
            .pipe(uploadStream)
            .on('done', (error) => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
        });

        outputFiles.push(storageDestination);

        processedSizes++;
        const progress = Math.round((processedSizes / totalSizes) * 100);
        await job.updateProgress(progress);
        await job.log(`Processed backdrop size ${size} to ${JSON.stringify(storageDestination)} (${progress}%)`);
      } catch (error) {
        this.logger.error(`Failed to process backdrop size ${size}: ${error.message}`);
        throw error;
      }
    });

    try {
      if ((await this.fileStorageSrv.deleteFile(file)) === false) {
        this.logger.error(`Failed to delete original file ${file.fileName}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete original file ${file.fileName}: ${error.message}`);
    }

    await Promise.all(processingPromises);

    await job.updateProgress(100);
    this.logger.log(`Processed all backdrop sizes for backdrop ${backdropID}`);

    return outputFiles;
  }
}
