import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalProviders } from '@ntx/external-providers/external-providers.constants';
import {
  ExternalMovieMetadata,
  ExternalSeriesMetadata,
  ExternalTitleSearchResultItem,
} from '@ntx/external-providers/external-providers.types';
import { TMDBMovie } from './interfaces/TMDBMovie';
import { TMDBMovieDetails } from './interfaces/TMDBMovieDetails';
import { TMDBTitle, TMDBTitleDetails, WeightedTMDBTitle } from './interfaces/TMDBTitle';
import { TMDBTVShow } from './interfaces/TMDBTVShow';
import { TMDBTVShowDetails } from './interfaces/TMDBTVShowDetails';

export class TMDBTitleMapper {
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

  public static TMDBTitleDetails2ExternalTitleMetadata(
    titleDetails: TMDBTitleDetails,
  ): ExternalMovieMetadata | ExternalSeriesMetadata {
    let type = TitleType.MOVIE;
    if ('number_of_seasons' in titleDetails) {
      type = TitleType.SERIES;
    }

    switch (type) {
      case TitleType.MOVIE: {
        const movieDetails = titleDetails as TMDBMovieDetails;

        const metadata: ExternalMovieMetadata = {
          name: movieDetails.title,
          originalName: movieDetails.original_title,
          releaseDate: movieDetails.release_date,
          runtime: movieDetails.runtime,
        };

        return metadata;
      }
      case TitleType.SERIES: {
        const tvShowDetails = titleDetails as TMDBTVShowDetails;

        const metadata: ExternalSeriesMetadata = {
          name: tvShowDetails.name,
          originalName: tvShowDetails.original_name,
          releaseDate: tvShowDetails.first_air_date,
          numberOfSeasons: tvShowDetails.number_of_seasons,
          numberOfEpisodes: tvShowDetails.number_of_episodes,
          seasons: tvShowDetails.seasons.map((season) => ({
            id: season.id.toString(),
            seasonNumber: season.season_number,
            releaseDate: season.air_date,
            episodeCount: season.episode_count,
            name: season.name,
          })),
        };

        return metadata;
      }
      default:
        throw new Error('Unknown title type');
    }
  }
}
