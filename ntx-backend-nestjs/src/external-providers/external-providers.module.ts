import { DynamicModule, Module, Provider } from '@nestjs/common';
import {
  EXTERNAL_TITLE_METADATA_RETRIEVER_TOKEN,
  EXTERNAL_TITLE_SEARCHER_TOKEN,
  EXTERNAL_TITLE_SELECTOR_TOKEN,
} from './external-providers.constants';
import { ExternalTitleService } from './external-title.service';
import { ProvidersExternalTitleMetadataRetriever } from './implementations/providers-external-title-metadata-retriever.class';
import { ProvidersExternalTitleSearcher } from './implementations/providers-external-title-searcher.class';
import { SameOrderExternalTitleSelector } from './implementations/same-order-external-title-selector.class';
import { IExternalTitleMetadataRetriever } from './interfaces/external-title-metadata-retriever.interface';
import { IExternalTitleProvider } from './interfaces/external-title-provider.interface';
import { IExternalTitleSearcher } from './interfaces/external-title-searcher.interface';
import { IExternalTitleSelector } from './interfaces/external-title-selector.interface';

@Module({})
export class ExternalProvidersModule {
  public static forRoot(): DynamicModule {
    const externalTitleProviders: IExternalTitleProvider[] = [];

    const providers: [
      Provider<IExternalTitleSearcher>,
      Provider<IExternalTitleSelector>,
      Provider<IExternalTitleMetadataRetriever>,
      Provider<ExternalTitleService>,
    ] = [
      { provide: EXTERNAL_TITLE_SEARCHER_TOKEN, useValue: new ProvidersExternalTitleSearcher(externalTitleProviders) },
      { provide: EXTERNAL_TITLE_SELECTOR_TOKEN, useValue: new SameOrderExternalTitleSelector() },
      { provide: EXTERNAL_TITLE_METADATA_RETRIEVER_TOKEN, useValue: new ProvidersExternalTitleMetadataRetriever() },
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
