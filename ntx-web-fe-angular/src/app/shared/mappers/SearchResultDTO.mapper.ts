import { ExternalTitleSearchResultItem, SearchResultItem } from '../models/librarySearch.dto';
import { SearchResultDTO } from '../models/searchBar.dto';

export class SearchResultDTOMapper {
  static anyToSearchResultDTOArray(items: any[]): SearchResultDTO[] {
    return items.map((item) => this.anyToSearchResultDTO(item));
  }

  static anyToSearchResultDTO(item: any): SearchResultDTO {
    if (item.id == null) {
      return this.mapExternalSearchResultToDTO(item as ExternalTitleSearchResultItem);
    } else {
      return this.mapInternalSearchResultToDTO(item as SearchResultItem);
    }
  }

  static mapInternalSearchResultToDTO(item: SearchResultItem): SearchResultDTO {
    return {
      id: item.id,
      name: item.metadata.name,
      type: item.type,
      posterURL: item.posterURL,
      year: new Date(item.metadata.releaseDate).getFullYear(),
      provider: null,
      item: item,
    };
  }
  static mapExternalSearchResultToDTO(item: ExternalTitleSearchResultItem): SearchResultDTO {
    return {
      id: null,
      name: item.metadata.name,
      type: item.type,
      posterURL: item.posterURL,
      year: new Date(item.metadata.releaseDate).getFullYear(),
      provider: item.providerID,
      item: item,
    };
  }
}
