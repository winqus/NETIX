import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalProviders } from '@ntx/external-providers/external-providers.constants';
import { TitleSearchResult } from '@ntx/external-providers/interfaces/TitleSearchResult.interface';
import { TMDBMovie } from './interfaces/TMDBMovie';
import { TMDBTitle } from './interfaces/TMDBTitle';
import { TMDBTVShow } from './interfaces/TMDBTVShow';

export class TMDBTitleMapper {
  public static TMDBTitle2TitleSearchResult(title: TMDBTitle): TitleSearchResult {
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
          weight: parseFloat(title.popularity.toFixed(3)),
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
          weight: parseFloat(title.popularity.toFixed(3)),
          releaseDate: title.first_air_date,
          sourceUUID: ExternalProviders.TMDB,
        };
        break;
      default:
        throw new Error('Unknown title type');
    }

    return result;
  }
}
