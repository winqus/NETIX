import { Inject, Injectable } from '@nestjs/common';
import { EntityRepository } from '@ntx/database/entity.repository';
import { Document, Model } from 'mongoose';
import { SERIES_TITLE_MODEL } from '../titles.constants';
import { SeriesTitle } from './interfaces/seriesTitle.interface';

@Injectable()
export class SeriesRepository extends EntityRepository<SeriesTitle> {
  constructor(@Inject(SERIES_TITLE_MODEL) model: Model<SeriesTitle & Document>) {
    super(model);
  }
}
