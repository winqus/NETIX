import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { FileStorageService } from '@ntx/file-storage/file-storage.service';
import { FileInStorage } from '@ntx/file-storage/types';
import * as sharp from 'sharp';
import {
  IMAGES_CREATE_POSTER_QUEUE,
  IMAGES_POSTER_CONTAINER,
  IMAGES_POSTER_QUEUE_CONCURRENCY,
  IMAGES_POSTER_SIZES,
  POSTER_EXTENTION,
} from '../images.constants';
import { PosterSize } from '../images.types';
import { makePosterFileName } from '../utils/images.utils';
import { CreatePosterJob } from './create-poster.types';

@Processor(IMAGES_CREATE_POSTER_QUEUE, {
  concurrency: IMAGES_POSTER_QUEUE_CONCURRENCY,
})
export class CreatePosterWorker extends WorkerHost {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly fileStorageSrv: FileStorageService) {
    super();
  }

  async process(job: CreatePosterJob, token?: string): Promise<FileInStorage[]> {
    this.logger.log(`Processing job #${job.id}`);

    try {
      const result = await this.handleCreatePosterJob(job, token);

      return result;
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }

  async handleCreatePosterJob(job: CreatePosterJob, _token?: string): Promise<FileInStorage[]> {
    const { posterID, file } = job.data;
    const sizes = Object.values(PosterSize);
    const totalSizes = sizes.length;
    let processedSizes = 0;

    const outputFiles: FileInStorage[] = [];

    const processingPromises = sizes.map(async (size) => {
      const { width, height } = IMAGES_POSTER_SIZES[size];

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
          container: IMAGES_POSTER_CONTAINER,
          fileName: makePosterFileName(posterID, size, POSTER_EXTENTION),
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
        await job.log(`Processed poster size ${size} to ${JSON.stringify(storageDestination)} (${progress}%)`);
      } catch (error) {
        this.logger.error(`Failed to process poster size ${size}: ${error.message}`);
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
    this.logger.log(`Processed all poster sizes for poster ${posterID}`);

    return outputFiles;
  }
}
