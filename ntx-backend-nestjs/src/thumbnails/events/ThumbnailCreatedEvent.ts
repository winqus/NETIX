export default class ThumbnailCreatedEvent {
  constructor(
    public readonly titleID: string,
    public readonly thumbnailID: string,
  ) {}
}
