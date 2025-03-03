import { TitleType } from '@ntx-shared/models/titleType.enum';

export enum Provider {
  NTX_DISCOVERY = 'NTX_DISCOVERY',
  NTX = 'NTX',
}

export interface LibrarySearchResultDTO {
  size: number;
  searchResults: [
    {
      id: 'ntx';
      size: number;
      results: SearchResultItem[];
    },
    {
      id: 'ntx-discovery';
      size: number;
      results: ExternalTitleSearchResultItem[];
    },
  ];
}

export interface SearchResultItem {
  id: string;
  type: TitleType.MOVIE;
  metadata: MovieResultMetadata;
  weight: number;
  posterURL?: string;
  backdropURL?: string;
}

export interface ExternalTitleSearchResultItem {
  providerID: string;
  externalID: string;
  type: TitleType;
  metadata: ExternalTitleMetadata;
  weight: number;
  posterURL?: string;
  backdropURL?: string;
}

export interface ExternalTitleMetadata {
  name: string;
  originalName: string;
  summary: string;
  releaseDate: string;
}

export interface TitleResultMetadata {
  name: string;
  originalName: string;
  summary: string;
  releaseDate: string;
}

export interface MovieResultMetadata extends TitleResultMetadata {
  runtimeMinutes: number;
}
