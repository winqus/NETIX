import { DynamicModule, Module, Provider } from '@nestjs/common';
import { EXTERNAL_TITLE_SEARCHER_TOKEN, EXTERNAL_TITLE_SELECTOR_TOKEN } from './external-providers.constants';
import { ExternalTitleService } from './external-title-search.service';
import { ProvidersExternalTitleSearcher } from './implementations/providers-external-title-searcher.class';
import { SameOrderExternalTitleSelector } from './implementations/same-order-external-title-selector.class';
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
      Provider<ExternalTitleService>,
    ] = [
      { provide: EXTERNAL_TITLE_SEARCHER_TOKEN, useValue: new ProvidersExternalTitleSearcher(externalTitleProviders) },
      { provide: EXTERNAL_TITLE_SELECTOR_TOKEN, useValue: new SameOrderExternalTitleSelector() },
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
