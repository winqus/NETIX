import { Inject, Injectable } from '@nestjs/common';
import { EntityRepository } from '@ntx/database/entity.repository';
import { Document, Model } from 'mongoose';
import { Thumbnail } from './interfaces/thumbnail.interface';
import { THUMBNAIL_MODEL } from './thumbnails.constants';

@Injectable()
export class ThumbnailsRepository extends EntityRepository<Thumbnail> {
  constructor(@Inject(THUMBNAIL_MODEL) model: Model<Thumbnail & Document>) {
    super(model);
  }
}
