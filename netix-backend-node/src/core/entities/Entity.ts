import UniqueEntityID from './UniqueEntityID';

export default abstract class Entity<T> {
  public uuid: UniqueEntityID;
  public props: T;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(props: T, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date) {
    this.props = props;
    this.uuid = uuid || new UniqueEntityID();
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || this.createdAt;
  }

  public equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false;
    }
    if (this === object) {
      return true;
    }
    if (!(object instanceof Entity)) {
      return false;
    }

    return this.uuid.equals(object.uuid);
  }
}
