import { Entity } from '@ntx/common/interfaces/entity.interface';
import { Name } from '@ntx/common/interfaces/name.interface';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { Thumbnail } from '@ntx/thumbnails/interfaces/thumbnail.interface';
import { Document } from 'mongoose';
import { MovieDetails } from './movieDetails.interface';
import { SeriesDetails } from './seriesDetails.interface';

export type TitleDocument = Title & Document;

export interface Title extends Entity {
  type: TitleType;
  thumbnails: Thumbnail[];
  names: Name[];
  releaseDate: Date;
  details: MovieDetails | SeriesDetails;
}
