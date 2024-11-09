import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ntx/database/database.module';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { JobQueueModule } from '@ntx/job-queue/job-queue.module';
import { DeleteVideoWorker } from './queues/delete-video.worker';
import { ProcessVideoWorker } from './queues/process-video.worker';
import { VideoRequirementsController } from './video-requirements.controller';
import { DELETE_VIDEO_QUEUE, PROCESS_VIDEO_QUEUE } from './videos.constants';
import { VideosController } from './videos.controller';
import { videosProviders } from './videos.providers';
import { VideosRepository } from './videos.repository';
import { VideosService } from './videos.service';

@Module({
  providers: [VideosService, VideosRepository, ...videosProviders, ProcessVideoWorker, DeleteVideoWorker],
  controllers: [VideoRequirementsController, VideosController],
  imports: [
    DatabaseModule,
    FileStorageModule,
    JobQueueModule.register(PROCESS_VIDEO_QUEUE),
    JobQueueModule.register(DELETE_VIDEO_QUEUE),
  ],
  exports: [VideosService],
})
export class VideosModule {}
