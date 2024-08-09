/**
 * Enum representing the different types of events in the application.
 * Payload classes can be found in the `src/common/events` directory.
 */
export enum NtxEvent {
  TitleCreatedFromExternalSource = 'Title.Created.FromExternalSource',
  MovieCreatedFromExternalSource = 'Title.MovieCreated.FromExternalSource',
  SeriesCreatedFromExternalSource = 'Title.SeriesCreated.FromExternalSource',
  ThumbnailCreatedForTitle = 'Thumbnail.Created.ForTitle',
  VideoCreatedForTitle = 'Video.Created.ForTitle',
}
