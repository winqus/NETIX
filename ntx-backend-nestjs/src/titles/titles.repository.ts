import { Inject, Injectable } from '@nestjs/common';
import { EntityRepository } from '@ntx/database/entity.repository';
import { Document, Model } from 'mongoose';
import { Title } from './interfaces/title.interface';
import { TITLE_MODEL } from './titles.constants';

@Injectable()
export class TitlesRepository extends EntityRepository<Title> {
  constructor(@Inject(TITLE_MODEL) titleModel: Model<Title & Document>) {
    super(titleModel);
  }
}
