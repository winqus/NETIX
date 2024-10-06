import { TitleType } from './titleType.enum';

export interface ExternalMovieDTO {
  externalID: string;
  providerID: string;
  type: TitleType;
  metadata: ExternalMovieMetadata;
  posterURL?: string;
  backdropURL?: string;
}

export interface ExternalMovieMetadata {
  name: string;
  originalName: string;
  summary: string;
  releaseDate: string;
  runtime: number;
}
