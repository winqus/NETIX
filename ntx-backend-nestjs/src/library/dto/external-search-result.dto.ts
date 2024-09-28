import { TitleResultShortMetadata } from './title-result-short-metadata.dto';

export interface ExternalSearchResultDTO {
  providerID: string;
  externalID: string;
  resultWeight: number;
  shortMetadata: TitleResultShortMetadata;
}
