import { TitleType } from './TitleType.enum';

export interface TitleDetailedSearchResult {
  title: string;
  originalTitle: string;
  id: string;
  type: TitleType;
  releaseDate: string;
  sourceUUID: string;
  details: MovieDetails | SeriesDetails;
}

export interface MovieDetails {
  runtime: number;
}

export interface SeriesDetails {
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons: {
    id: string;
    name: string;
    seasonNumber: number;
    episodeCount: number;
    releaseDate: string | null;
  };
}
