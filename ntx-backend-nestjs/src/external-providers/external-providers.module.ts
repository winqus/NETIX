import { DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import { TMDBSetup } from './3rd-party-providers/tmdb/TMDB.service';
import { TMDBWithAPIV3AndFuseJsServiceFactory } from './3rd-party-providers/tmdb/TMDB.service.factory';
import {
  EXTERNAL_TITLE_METADATA_RETRIEVER_TOKEN,
  EXTERNAL_TITLE_SEARCHER_TOKEN,
  EXTERNAL_TITLE_SELECTOR_TOKEN,
  ExternalProviders,
} from './external-providers.constants';
import { ExternalTitleService } from './external-title.service';
import { ProvidersExternalTitleMetadataRetriever } from './implementations/providers-external-title-metadata-retriever.class';
import { ProvidersExternalTitleSearcher } from './implementations/providers-external-title-searcher.class';
import { SameOrderExternalTitleSelector } from './implementations/same-order-external-title-selector.class';
import { IExternalTitleMetadataRetriever } from './interfaces/external-title-metadata-retriever.interface';
import { IExternalTitleProvider } from './interfaces/external-title-provider.interface';
import { IExternalTitleSearcher } from './interfaces/external-title-searcher.interface';
import { IExternalTitleSelector } from './interfaces/external-title-selector.interface';

function getProviderInstance<P extends ExternalProviders>(
  provider: ExternalProviders,
  options: ExternalProvidersModuleOptions[P],
): IExternalTitleProvider {
  switch (provider) {
    case ExternalProviders.TMDB:
      const setup = options as ExternalProvidersModuleOptions[P];

      return TMDBWithAPIV3AndFuseJsServiceFactory(setup, new Logger(ExternalProviders.TMDB));
    default:
      throw new Error(`Provider ${provider} is not implemented.`);
  }
}

export type ExternalProvidersModuleOptions = {
  [ExternalProviders.TMDB]: TMDBSetup & { enable: boolean };
};

@Module({})
export class ExternalProvidersModule {
  public static forRoot(options: ExternalProvidersModuleOptions): DynamicModule {
    const externalTitleProviders: IExternalTitleProvider[] = [];

    for (const providerKey in options) {
      if (Object.prototype.hasOwnProperty.call(options, providerKey)) {
        const providerOption = options[providerKey as ExternalProviders];
        if (providerOption.enable === true) {
          const provider = getProviderInstance(providerKey as ExternalProviders, providerOption);
          externalTitleProviders.push(provider);
        }
      }
    }

    const providers: [
      Provider<IExternalTitleSearcher>,
      Provider<IExternalTitleSelector>,
      Provider<IExternalTitleMetadataRetriever>,
      Provider<ExternalTitleService>,
    ] = [
      {
        provide: EXTERNAL_TITLE_SEARCHER_TOKEN,
        useFactory: () => new ProvidersExternalTitleSearcher(externalTitleProviders),
      },
      { provide: EXTERNAL_TITLE_SELECTOR_TOKEN, useFactory: () => new SameOrderExternalTitleSelector() },
      {
        provide: EXTERNAL_TITLE_METADATA_RETRIEVER_TOKEN,
        useFactory: () => new ProvidersExternalTitleMetadataRetriever(externalTitleProviders),
      },
      ExternalTitleService,
    ];

    return {
      module: ExternalProvidersModule,
      providers: [...providers],
      global: true,
      exports: [ExternalTitleService],
    };
  }
}
