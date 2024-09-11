import TitleCreatedFromExternalSourceEvent from '@ntx/common/events/TitleCreatedFromExternalSourceEvent';
import { TitleDetailedSearchResult } from '@ntx/external-search/interfaces/TitleDetailedSearchResult.interface';
import { MovieTitle } from '../../titles-legacy/movies/interfaces/movieTitle.interface';

export default class MovieCreatedFromExternalSourceEvent extends TitleCreatedFromExternalSourceEvent {
  constructor(
    public readonly createdMovie: MovieTitle,
    public readonly externalTitle: TitleDetailedSearchResult,
  ) {
    super(createdMovie, externalTitle);
  }
}
