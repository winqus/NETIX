import { Inject, Injectable } from '@nestjs/common';
import { EntityRepository } from '@ntx/database/entity.repository';
import { Document, Model } from 'mongoose';
import { MOVIE_TITLE_MODEL } from '../titles.constants';
import { MovieTitle } from './interfaces/movieTitle.interface';

@Injectable()
export class MoviesRepository extends EntityRepository<MovieTitle> {
  constructor(@Inject(MOVIE_TITLE_MODEL) model: Model<MovieTitle & Document>) {
    super(model);
  }
}
