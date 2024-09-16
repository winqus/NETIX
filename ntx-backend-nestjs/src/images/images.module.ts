import { Module } from '@nestjs/common';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { JobQueueModule } from '@ntx/job-queue/job-queue.module';
import { IMAGES_CREATE_POSTER_QUEUE } from './images.constants';
import { PosterService } from './poster.service';
import { CreatePosterWorker } from './queues/create-poster.worker';

@Module({
  providers: [PosterService, CreatePosterWorker],
  exports: [PosterService],
  imports: [FileStorageModule, JobQueueModule.register(IMAGES_CREATE_POSTER_QUEUE)],
})
export class ImagesModule {}
