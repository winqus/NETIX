import Entity from './Entity';
import UniqueEntityID from './UniqueEntityID';

export default abstract class MediaItem<T> extends Entity<T> {
  private readonly _createdAt: Date;
  private readonly _updatedAt: Date;
  private readonly _deletedAt?: Date;
  private readonly _uploaderId: UniqueEntityID;

  get uuid(): UniqueEntityID {
    return this._uuid;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  get deletedAt(): Date | undefined {
    return this._deletedAt;
  }
  get uploaderId(): UniqueEntityID {
    return this._uploaderId;
  }
  constructor(props: T, uuid: UniqueEntityID, createdAt: Date, updatedAt: Date, uploaderId: UniqueEntityID, deletedAt?: Date) {
    super(props, uuid);
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._deletedAt = deletedAt;
    this._uploaderId = uploaderId;
  }
}
