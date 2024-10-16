import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { JobQueueModule } from '@ntx/job-queue/job-queue.module';
import { BackdropsController } from './backdrop.contollers';
import { BackDropService } from './backdrop.service';
import { ImagesProxyController } from './images-proxy.controller';
import { CREATE_POSTER_QUEUE, IMAGES_CREATE_BACKDROP_QUEUE } from './images.constants';
import { PostersController } from './poster.contollers';
import { PosterService } from './poster.service';
import { CreateBackdropWorker } from './queues/create-backdrop.worker';
import { CreatePosterWorker } from './queues/create-poster.worker';

@Module({
  controllers: [PostersController, ImagesProxyController, BackdropsController],
  providers: [PosterService, CreatePosterWorker, BackDropService, CreateBackdropWorker],
  exports: [PosterService, BackDropService],
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    FileStorageModule,
    JobQueueModule.register(CREATE_POSTER_QUEUE),
    JobQueueModule.register(IMAGES_CREATE_BACKDROP_QUEUE),
  ],
})
export class ImagesModule {}
