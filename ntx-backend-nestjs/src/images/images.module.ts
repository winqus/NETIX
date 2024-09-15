import { Module } from '@nestjs/common';
import { PosterService } from './poster.service';

@Module({
  providers: [PosterService],
  exports: [PosterService],
})
export class ImagesModule {}
