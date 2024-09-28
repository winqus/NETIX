import { MovieResultShortMetadata } from './movie-result-short-metadata.dto';

export interface MovieSearchResultDTO {
  providerID: 'ntx';
  resultWeight: 1.0;
  shortMovieMetadata: MovieResultShortMetadata;
}
