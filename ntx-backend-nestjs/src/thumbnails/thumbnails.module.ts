import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ThumbnailProcessor } from './queue/thumbnail.processor';
import { THUMBNAIL_QUEUE } from './thumbnails.constants';
import { ThumbnailsController } from './thumbnails.controller';
import { ThumbnailsService } from './thumbnails.service';

@Module({
  controllers: [ThumbnailsController],
  providers: [ThumbnailsService, ThumbnailProcessor],
  imports: [
    BullModule.registerQueue({
      name: THUMBNAIL_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: THUMBNAIL_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
})
export class ThumbnailsModule {}
