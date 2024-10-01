import { Logger } from '@nestjs/common';
import {
  EXTERNAL_TITLE_PROVIDER_DEFAULT_API_RATE_LIMIT_MS,
  EXTERNAL_TITLE_PROVIDERS_ENABLED_BY_DEFAULT,
} from '@ntx/external-providers/external-providers.constants';
import { ExternalProviderConfig } from '@ntx/external-providers/interfaces/external-title-provider.interface';
import { TMDBConfig, TMDBSetup } from './TMDB.service';

export function defaultTMDBFactory(setup: TMDBSetup): ExternalProviderConfig & TMDBConfig {
  if ('apiKey' in setup === false || setup.apiKey.length < 1) {
    throw new Error('API key not provided for TMDB');
  }

  if ('rateLimitMs' in setup === false || setup.rateLimitMs == null) {
    setup.rateLimitMs = EXTERNAL_TITLE_PROVIDER_DEFAULT_API_RATE_LIMIT_MS;
    new Logger('defaultTMDBFactory').log(`Rate limit not provided, using default: ${setup.rateLimitMs}`);
  }

  return {
    enabled: setup.enable || EXTERNAL_TITLE_PROVIDERS_ENABLED_BY_DEFAULT,
    apiKey: setup.apiKey,
    rateLimitMs: setup.rateLimitMs || EXTERNAL_TITLE_PROVIDER_DEFAULT_API_RATE_LIMIT_MS,
  };
}
