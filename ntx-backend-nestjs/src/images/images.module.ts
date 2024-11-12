import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { JobQueueModule } from '@ntx/job-queue/job-queue.module';
import { BackdropsController } from './backdrops.contoller';
import { BackdropsService } from './backdrops.service';
import { ImagesProxyController } from './images-proxy.controller';
import { CREATE_BACKDROP_QUEUE, CREATE_POSTER_QUEUE } from './images.constants';
import { PostersController } from './posters.contollers';
import { PostersService } from './posters.service';
import { CreateBackdropWorker } from './queues/create-backdrop.worker';
import { CreatePosterWorker } from './queues/create-poster.worker';

@Module({
  controllers: [PostersController, ImagesProxyController, BackdropsController],
  providers: [PostersService, CreatePosterWorker, BackdropsService, CreateBackdropWorker],
  exports: [PostersService, BackdropsService],
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    FileStorageModule,
    JobQueueModule.register(CREATE_POSTER_QUEUE),
    JobQueueModule.register(CREATE_BACKDROP_QUEUE),
  ],
})
export class ImagesModule {}
