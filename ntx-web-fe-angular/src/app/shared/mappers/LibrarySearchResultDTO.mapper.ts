import { LibrarySearchResultDTO, SearchResultItem, ExternalTitleSearchResultItem, MovieResultMetadata, ExternalTitleMetadata } from '../models/librarySearch.dto';
import { TitleType } from '@ntx-shared/models/titleType.enum';

export class LibrarySearchResultDTOMapper {
  static anyToLibrarySearchResultDTO(item: any): LibrarySearchResultDTO {
    return {
      size: item.size,
      searchResults: [
        {
          id: 'ntx',
          size: item.searchResults[0].size,
          results: item.searchResults[0].results.map((result: any) => this.anyToSearchResultItem(result)),
        },
        {
          id: 'ntx-discovery',
          size: item.searchResults[1].size,
          results: item.searchResults[1].results.map((result: any) => this.anyToExternalTitleSearchResultItem(result)),
        },
      ],
    };
  }

  static anyToSearchResultItem(item: any): SearchResultItem {
    return {
      type: item.type as TitleType.MOVIE,
      metadata: this.anyToMovieResultMetadata(item.metadata),
      weight: item.weight,
      posterURL: item.posterURL || null,
      backdropURL: item.backdropURL || null,
    };
  }

  static anyToExternalTitleSearchResultItem(item: any): ExternalTitleSearchResultItem {
    return {
      providerID: item.providerID,
      externalID: item.externalID,
      type: item.type as TitleType,
      metadata: this.anyToExternalTitleMetadata(item.metadata),
      weight: item.weight,
      posterURL: item.posterURL || null,
      backdropURL: item.backdropURL || null,
    };
  }

  static anyToMovieResultMetadata(item: any): MovieResultMetadata {
    return {
      name: item.name,
      originalName: item.originalName,
      summary: item.summary,
      releaseDate: item.releaseDate,
      runtimeMinutes: item.runtimeMinutes,
    };
  }

  static anyToExternalTitleMetadata(item: any): ExternalTitleMetadata {
    return {
      name: item.name,
      originalName: item.originalName,
      summary: item.summary,
      releaseDate: item.releaseDate,
    };
  }
}
