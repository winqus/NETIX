import { Module } from '@nestjs/common';
import { VideoRequirementsController } from './video-requirements.controller';
import { VideosService } from './videos.service';

@Module({
  providers: [VideosService],
  controllers: [VideoRequirementsController],
})
export class VideosModule {}
