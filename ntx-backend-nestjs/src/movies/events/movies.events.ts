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
    public readonly id: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly changes: Record<string, any>,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MoviePublishedEvent {
  constructor(
    public readonly id: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieUnpublishedEvent {
  constructor(
    public readonly id: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieDeletedEvent {
  constructor(
    public readonly id: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MoviePosterUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly posterID: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieBackdropUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly backdropID: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieVideoUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly videoID: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
