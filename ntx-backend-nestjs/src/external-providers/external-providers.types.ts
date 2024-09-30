import { TitleType } from '@ntx/common/interfaces/TitleType.enum';

export interface ExternalTitle<T extends TitleType = TitleType> {
  externalID: string;
  providerID: string;
  type: T;
}

export interface ExternalTitleMetadata {
  name: string;
  originalName: string;
  releaseDate: string;
}

export interface ExternalTitleSearchRequest {
  query: string;
  types?: TitleType[];
  providers?: string[];
  maxResults?: number;
}

export interface ExternalTitleSearchResult {
  size: number;
  results: ExternalTitleSearchResultItem[];
}

export interface ExternalTitleSearchResultItem {
  providerID: string;
  externalID: string;
  type: TitleType;
  metadata: ExternalTitleMetadata;
  weight: number;
}

export interface ExternalTitleMetadataRequest<T extends TitleType = TitleType> {
  externalID: string;
  providerID: string;
  type: T;
}

export interface ExternalTitleMetadataResult<T extends TitleType = TitleType> {
  externalID: string;
  providerID: string;
  type: T;
  metadata: TitleTypeMetadataMap[T];
}

type TitleTypeMetadataMap = {
  [TitleType.MOVIE]: ExternalMovieMetadata;
  [TitleType.SERIES]: ExternalSeriesMetadata;
};

export interface ExternalMovieMetadata extends ExternalTitleMetadata {
  runtime: number;
}

export interface ExternalSeriesMetadata extends ExternalTitleMetadata {
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  seasons: {
    id: string;
    name: string;
    seasonNumber: number;
    episodeCount: number;
    releaseDate: string | null;
  }[];
}
