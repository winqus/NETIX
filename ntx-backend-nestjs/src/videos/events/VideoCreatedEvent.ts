export default class VideoCreatedEvent {
  constructor(
    public readonly titleID: string,
    public readonly videoID: string,
  ) {}
}
