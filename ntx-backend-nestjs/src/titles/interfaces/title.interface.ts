import { Entity } from '@ntx/common/interfaces/entity.interface';
import { Name } from '@ntx/common/interfaces/name.interface';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { Thumbnail } from '@ntx/thumbnails/interfaces/thumbnail.interface';
import { Document } from 'mongoose';
import { MovieDetails } from './movieDetails.interface';
import { SeriesDetails } from './seriesDetails.interface';

export interface Title extends Entity, Document {
  readonly uuid: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly type: TitleType;
  readonly thumbnails: [Thumbnail];
  readonly names: [Name];
  readonly releaseDate: Date;
  readonly details: MovieDetails | SeriesDetails;
  readonly externalInformationUUID?: string;
}
