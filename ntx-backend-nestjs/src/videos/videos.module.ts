import { Module } from '@nestjs/common';
import { VideoRequirementsController } from './video-requirements.controller';
import { VideosRepository } from './videos.repository';
import { VideosService } from './videos.service';

@Module({
  providers: [VideosService, VideosRepository],
  controllers: [VideoRequirementsController],
})
export class VideosModule {}
