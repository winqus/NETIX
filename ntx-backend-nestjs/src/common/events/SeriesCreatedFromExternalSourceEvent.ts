import TitleCreatedFromExternalSourceEvent from '@ntx/common/events/TitleCreatedFromExternalSourceEvent';
import { TitleDetailedSearchResult } from '@ntx/external-search/interfaces/TitleDetailedSearchResult.interface';
import { SeriesTitle } from '@ntx/titles-legacy/series/interfaces/seriesTitle.interface';

export default class SeriesCreatedFromExternalSourceEvent extends TitleCreatedFromExternalSourceEvent {
  constructor(
    public readonly createdSeries: SeriesTitle,
    public readonly externalTitle: TitleDetailedSearchResult,
  ) {
    super(createdSeries, externalTitle);
  }
}
