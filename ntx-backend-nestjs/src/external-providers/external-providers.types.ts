import { TitleType } from '@ntx/common/interfaces/TitleType.enum';

export interface ExternalTitleSearchRequest {
  query: string;
  types?: TitleType[];
  providers?: string[];
  maxResults?: number;
}

export interface ExternalTitleSearchResultDTO {
  size: number;
  results: ExternalTitleSearchResult[];
}

export interface ExternalTitleSearchResultCandidate {
  providerID: string;
  externalID: string;
  type: TitleType;
  metadata: {
    name: string;
    originalName: string;
    releaseDate: string;
  };
}

export interface ExternalTitleSearchResult {
  providerID: string;
  externalID: string;
  type: TitleType;
  weight: number;
  metadata: {
    name: string;
    originalName: string;
    releaseDate: string;
  };
}
