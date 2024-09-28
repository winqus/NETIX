import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalTitleMetadataRequest, ExternalTitleMetadataResult } from '../external-providers.types';
import { IExternalTitleMetadataRetriever } from '../interfaces/external-title-metadata-retriever.interface';

export class ProvidersExternalTitleMetadataRetriever implements IExternalTitleMetadataRetriever {
  public async getMetadata<T extends TitleType>(
    request: ExternalTitleMetadataRequest<T>,
  ): Promise<ExternalTitleMetadataResult<T>> {
    throw new Error('Method not implemented.');
  }
}
