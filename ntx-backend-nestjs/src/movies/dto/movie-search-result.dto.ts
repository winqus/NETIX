import { TitleResultMetadata } from '@ntx/common/interfaces/title-result-metadata.interface';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';

export interface MovieSearchResultDTO {
  size: number;
  results: MovieSearchResultItem[];
}

export interface MovieSearchResultItem {
  id: string;
  type: TitleType.MOVIE;
  metadata: MovieResultMetadata;
  weight: number;
  posterURL?: string;
  backdropURL?: string;
}

export interface MovieResultMetadata extends TitleResultMetadata {
  runtimeMinutes: number;
}
