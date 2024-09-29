import { TitleType } from '@ntx/common/interfaces/TitleType.enum';

export interface TitleDetailedSearchResult<T extends TitleType = TitleType> {
  title: string;
  originalTitle: string;
  id: string;
  type: T;
  releaseDate: string;
  sourceUUID: string;
  details: TitleTypeDetailsMap[T];
}

type TitleTypeDetailsMap = {
  [TitleType.MOVIE]: MovieDetails;
  [TitleType.SERIES]: SeriesDetails;
};

export interface MovieDetails {
  runtime: number;
}

export interface SeriesDetails {
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons: [
    {
      id: string;
      name: string;
      seasonNumber: number;
      episodeCount: number;
      releaseDate: string | null;
    },
  ];
}
