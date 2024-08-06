/**
 * Enum representing the different types of events in the application.
 * Payload classes can be found in the `src/common/events` directory.
 */
export enum NtxEvent {
  TitleCreatedFromExternalSource = 'titles.CreatedFromExternalSource',
  MovieCreatedFromExternalSource = 'titles.MovieCreatedFromExternalSource',
  SeriesCreatedFromExternalSource = 'titles.SeriesCreatedFromExternalSource',
  ThumbnailCreatedForTitle = 'thumbnail.CreatedForTitle',
}
