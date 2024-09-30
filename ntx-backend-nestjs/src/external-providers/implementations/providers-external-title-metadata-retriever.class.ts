import { Logger } from '@nestjs/common';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalProviders } from '../external-providers.constants';
import { ExternalTitleMetadataRequest, ExternalTitleMetadataResult } from '../external-providers.types';
import { IExternalTitleMetadataRetriever } from '../interfaces/external-title-metadata-retriever.interface';
import { IExternalTitleProvider } from '../interfaces/external-title-provider.interface';

export class ProvidersExternalTitleMetadataRetriever implements IExternalTitleMetadataRetriever {
  private readonly logger = new Logger(this.constructor.name);
  private readonly externalProviderMap: Map<string, IExternalTitleProvider | null>;

  constructor(externalProviders: IExternalTitleProvider[]) {
    this.externalProviderMap = new Map();
    if (!externalProviders || externalProviders.length === 0) {
      this.logger.warn('Initialized without any external providers.');
    }

    for (const provider of Object.values(ExternalProviders)) {
      const externalProvider = externalProviders.find((p) => p.getProviderID() === provider && p.isEnabled());
      this.externalProviderMap.set(provider, externalProvider ?? null);
    }
  }

  public async getMetadata<T extends TitleType>(
    request: ExternalTitleMetadataRequest<T>,
  ): Promise<ExternalTitleMetadataResult<T> | null> {
    const { externalID, providerID, type } = request;

    if (externalID == null || externalID === '') {
      throw new Error('External ID is required');
    }

    if (providerID == null || providerID === '') {
      throw new Error('Provider ID is required');
    }

    if (type == null) {
      throw new Error('Type is required');
    }

    const externalProvider = this.externalProviderMap.get(providerID);
    if (externalProvider == null || externalProvider.isEnabled() === false) {
      this.logger.error(`Provider ${providerID} is not enabled`);
      throw new Error(`Metadata retrieval failed`);
    }

    const metadata = await externalProvider.getMetadata(externalID, type);

    if (metadata == null) {
      this.logger.log(`Failed to retrieve metadata for ${providerID}:${externalID}`);
    }

    return metadata;
  }
}
