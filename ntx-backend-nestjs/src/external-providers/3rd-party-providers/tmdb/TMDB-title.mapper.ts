import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalProviders } from '@ntx/external-providers/external-providers.constants';
import { ExternalTitleSearchResultItem } from '@ntx/external-providers/external-providers.types';
import { TitleSearchResult } from '@ntx/external-providers/interfaces/TitleSearchResult.interface';
import { TMDBMovie } from './interfaces/TMDBMovie';
import { TMDBTitle, WeightedTMDBTitle } from './interfaces/TMDBTitle';
import { TMDBTVShow } from './interfaces/TMDBTVShow';

export class TMDBTitleMapper {
  public static TMDBTitle2TitleSearchResult(title: TMDBTitle | WeightedTMDBTitle): TitleSearchResult {
    let type = TitleType.MOVIE;
    if ('first_air_date' in title) {
      type = TitleType.SERIES;
    }

    let result: TitleSearchResult = {} as any;

    switch (type) {
      case TitleType.MOVIE:
        title = title as TMDBMovie;
        result = {
          id: title.id.toString(),
          title: title.title,
          originalTitle: title.original_title,
          type: type,
          weight: 'weight' in title ? (title as any).weight : 0.0,
          releaseDate: title.release_date,
          sourceUUID: ExternalProviders.TMDB,
        };

        break;
      case TitleType.SERIES:
        title = title as TMDBTVShow;
        result = {
          id: title.id.toString(),
          title: title.name,
          originalTitle: title.original_name,
          type: type,
          weight: 'weight' in title ? (title as any).weight : 0.0,
          releaseDate: title.first_air_date,
          sourceUUID: ExternalProviders.TMDB,
        };
        break;
      default:
        throw new Error('Unknown title type');
    }

    return result;
  }

  public static TMDBTitle2ExternalTitleSearchResultItem(
    title: TMDBTitle | WeightedTMDBTitle,
  ): ExternalTitleSearchResultItem {
    let type = TitleType.MOVIE;
    if ('first_air_date' in title) {
      type = TitleType.SERIES;
    }

    const result: Partial<ExternalTitleSearchResultItem> = {
      providerID: ExternalProviders.TMDB,
      externalID: title.id.toString(),
      type: type,
      weight: 'weight' in title ? title.weight : 0.0,
      // weight: 'weight' in title ? parseFloat(title.weight.toFixed(3)) : 0.0,
    };

    switch (type) {
      case TitleType.MOVIE:
        title = title as TMDBMovie;

        (result as ExternalTitleSearchResultItem).metadata = {
          name: title.title,
          originalName: title.original_title,
          releaseDate: title.release_date,
        };

        break;
      case TitleType.SERIES:
        title = title as TMDBTVShow;

        (result as ExternalTitleSearchResultItem).metadata = {
          name: title.name,
          originalName: title.original_name,
          releaseDate: title.first_air_date,
        };
        break;
      default:
        throw new Error('Unknown title type');
    }

    return result as ExternalTitleSearchResultItem;
  }
}
