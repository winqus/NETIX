import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ntx/database/database.module';
import { VideoProcessor } from './queue/video.processor';
import { VIDEO_QUEUE } from './videos.constants';
import { VideosController } from './videos.controller';
import { videosProviders } from './videos.providers';
import { VideosRepository } from './videos.repository';
import { VideosService } from './videos.service';

@Module({
  controllers: [VideosController],
  providers: [VideosService, VideoProcessor, VideosRepository, ...videosProviders],
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: VIDEO_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: VIDEO_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
})
export class VideosModule {}
