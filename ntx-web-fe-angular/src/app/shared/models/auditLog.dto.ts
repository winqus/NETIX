import { MovieDTO } from './movie.dto';

export interface AuditLogDTO {
  id: string;
  event: MovieEvent;
  movieId: string;
  changes?: Partial<MovieDTO>;
  timestamp: string;
  userID: string;
  username: string;
}

export enum MovieEvent {
  Created = 'movie.created',
  Updated = 'movie.updated',
  PosterUpdated = 'movie.posterUpdated',
  BackdropUpdated = 'movie.backdropUpdated',
  VideoUpdated = 'movie.videoUpdated',
  Published = 'movie.published',
  Unpublished = 'movie.unpublished',
  Deleted = 'movie.deleted',
}
