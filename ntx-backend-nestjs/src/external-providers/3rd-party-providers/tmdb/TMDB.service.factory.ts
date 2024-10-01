import { Logger } from '@nestjs/common';
import { TMDBMovieGatewayAPIv3 } from './TMDB-movie-gateway-api-v3.class';
import { TMDBTitleSelectorFuseJS } from './TMDB-title-selector-fusejs.class';
import { TMDBTVShowGatewayAPIv3 } from './TMDB-tv-show-gateway-api-v3.class';
import { TMDBConfig, TMDBService, TMDBSetup } from './TMDB.service';

export function TMDBWithAPIV3AndFuseJsServiceFactory(setup: TMDBSetup, logger?: Logger): TMDBService {
  const tmdbMovieGateway = new TMDBMovieGatewayAPIv3(
    setup as TMDBConfig,
    logger || new Logger(TMDBMovieGatewayAPIv3.name),
  );

  const tmdbTVShowGateway = new TMDBTVShowGatewayAPIv3(
    setup as TMDBConfig,
    logger || new Logger(TMDBTVShowGatewayAPIv3.name),
  );

  const tmdbTitleSelector = new TMDBTitleSelectorFuseJS();

  return new TMDBService(setup, tmdbMovieGateway, tmdbTVShowGateway, tmdbTitleSelector, logger);
}
