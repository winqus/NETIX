import { TitleDetailedSearchResult } from '@ntx/external-search/interfaces/TitleDetailedSearchResult.interface';
import { Title } from '@ntx/titles/interfaces/title.interface';

export default class TitleCreatedFromExternalSourceEvent {
  constructor(
    public readonly createdTitle: Title,
    public readonly externalTitle: TitleDetailedSearchResult,
  ) {}
}
