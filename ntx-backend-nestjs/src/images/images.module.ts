import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { JobQueueModule } from '@ntx/job-queue/job-queue.module';
import { ImagesProxyController } from './images-proxy.controller';
import { CREATE_POSTER_QUEUE } from './images.constants';
import { PostersController } from './poster.contollers';
import { PosterService } from './poster.service';
import { CreatePosterWorker } from './queues/create-poster.worker';

@Module({
  controllers: [PostersController, ImagesProxyController],
  providers: [PosterService, CreatePosterWorker],
  exports: [PosterService],
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    FileStorageModule,
    JobQueueModule.register(CREATE_POSTER_QUEUE),
  ],
})
export class ImagesModule {}
