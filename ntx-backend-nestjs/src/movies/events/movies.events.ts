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
    public readonly posterID: string, // Identifier for the new poster
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieBackdropUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly backdropID: string, // Identifier for the new backdrop
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class MovieVideoUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly videoID: string, // Identifier for the new video
    public readonly timestamp: Date = new Date(),
  ) {}
}
