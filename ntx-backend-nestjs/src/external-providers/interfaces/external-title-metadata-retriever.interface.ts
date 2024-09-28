import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ExternalTitleMetadataRequest, ExternalTitleMetadataResult } from '../external-providers.types';

export interface IExternalTitleMetadataRetriever {
  getMetadata<T extends TitleType>(request: ExternalTitleMetadataRequest<T>): Promise<ExternalTitleMetadataResult<T>>;
}
