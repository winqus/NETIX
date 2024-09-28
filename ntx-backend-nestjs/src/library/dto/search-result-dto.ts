import { ExternalSearchResultDTO } from './external-search-result.dto';

export interface SearchResultDTO {
  size: number;
  results: [
    {
      id: string;
      size: number;
      searchResults: ExternalSearchResultDTO[];
    },
  ];
}
