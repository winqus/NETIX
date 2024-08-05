import MovieCreatedFromExternalSourceEvent from './common/events/MovieCreatedFromExternalSourceEvent';
import SeriesCreatedFromExternalSourceEvent from './common/events/SeriesCreatedFromExternalSourceEvent';
import TitleCreatedFromExternalSourceEvent from './common/events/TitleCreatedFromExternalSourceEvent';

export enum NtxEvent {
  TitleCreatedFromExternalSource = 'titles.CreatedFromExternalSource',
  MovieCreatedFromExternalSource = 'titles.MovieCreatedFromExternalSource',
  SeriesCreatedFromExternalSource = 'titles.SeriesCreatedFromExternalSource',
}

export const NtxEventPayload = {
  [NtxEvent.TitleCreatedFromExternalSource]: TitleCreatedFromExternalSourceEvent,
  [NtxEvent.MovieCreatedFromExternalSource]: MovieCreatedFromExternalSourceEvent,
  [NtxEvent.SeriesCreatedFromExternalSource]: SeriesCreatedFromExternalSourceEvent,
};
