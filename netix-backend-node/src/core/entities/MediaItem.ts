import Entity from './Entity';
import UniqueEntityID from './UniqueEntityID';

export default abstract class MediaItem<T> extends Entity<T> {
  private updatedAt: Date;
  protected readonly uploaderId: UniqueEntityID;

  get lastUpdated(): Date {
    return this.updatedAt;
  }

  protected set lastUpdated(date: Date) {
    this.updatedAt = date;
  }

  constructor(props: T, uuid: UniqueEntityID, uploaderId: UniqueEntityID) {
    super(props, uuid);
    this.updatedAt = this.createdAt;
    this.uploaderId = uploaderId;
  }
}
