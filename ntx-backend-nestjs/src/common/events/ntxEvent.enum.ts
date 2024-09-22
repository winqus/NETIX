/**
 * Enum representing the different types of events in the application.
 * Payload classes can be found in the `src/common/events` directory.
 */
export enum NtxEvent {}

// Example enumerations for later:
// TitleCreatedFromExternalSource = 'Title.Created.FromExternalSource',
// MovieCreatedFromExternalSource = 'Title.MovieCreated.FromExternalSource',
// SeriesCreatedFromExternalSource = 'Title.SeriesCreated.FromExternalSource',
// ThumbnailCreatedForTitle = 'Thumbnail.Created.ForTitle',
// VideoCreatedForTitle = 'Video.Created.ForTitle',

// Example event classes for later:
// export default class TitleCreatedFromExternalSourceEvent {
//   constructor(
//     public readonly createdTitle: Title,
//     public readonly externalTitle: TitleDetailedSearchResult,
//   ) {}
// }
// export default class MovieCreatedFromExternalSourceEvent extends TitleCreatedFromExternalSourceEvent {
//   constructor(
//     public readonly createdMovie: MovieTitle,
//     public readonly externalTitle: TitleDetailedSearchResult,
//   ) {
//     super(createdMovie, externalTitle);
//   }
// }
