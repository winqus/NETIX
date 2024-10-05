import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalTitleSearchResultItem } from '@ntx/external-providers/external-providers.types';
import { MovieResultMetadata } from '@ntx/movies/dto/movie-search-result.dto';

export interface SearchResultDTO {
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
  type: TitleType.MOVIE;
  metadata: MovieResultMetadata;
  weight: number;
  posterURL?: string;
  backdropURL?: string;
}
