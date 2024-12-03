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

export class MovieCreatedEvent {
  constructor(
    public readonly movieID: string,
    public readonly userID: string,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieUpdatedEvent {
  constructor(
    public readonly movieID: string,
    public readonly changes: Record<string, any>,
    public readonly userID: string,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MoviePublishedEvent {
  constructor(
    public readonly movieID: string,
    public readonly userID: string,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieUnpublishedEvent {
  constructor(
    public readonly movieID: string,
    public readonly userID: string,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieDeletedEvent {
  constructor(
    public readonly movieID: string,
    public readonly userID: string,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MoviePosterUpdatedEvent {
  constructor(
    public readonly movieID: string,
    public readonly posterID: string,
    public readonly userID: string,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieBackdropUpdatedEvent {
  constructor(
    public readonly movieID: string,
    public readonly backdropID: string,
    public readonly userID: string,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieVideoUpdatedEvent {
  constructor(
    public readonly movieID: string,
    public readonly videoID: string,
    public readonly userID: string,
    public readonly username: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
