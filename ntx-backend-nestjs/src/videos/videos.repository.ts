import { Inject, Injectable } from '@nestjs/common';
import { EntityRepository } from '@ntx/database/entity.repository';
import { Document, Model } from 'mongoose';
import { Video } from './interfaces/video.interface';
import { VIDEO_MODEL } from './videos.constants';

@Injectable()
export class VideosRepository extends EntityRepository<Video> {
  constructor(@Inject(VIDEO_MODEL) model: Model<Video & Document>) {
    super(model);
  }
}
