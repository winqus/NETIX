import { Logger } from '@nestjs/common';
import { TMDBService, TMDBSetup } from './TMDB.service';

export function TMDBWithAPIV3AndFuseJsServiceFactory(setup: TMDBSetup, logger?: Logger): TMDBService {
  return new TMDBService(setup, logger);
}
