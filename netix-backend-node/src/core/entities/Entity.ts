import UniqueEntityID from './UniqueEntityID';

export default abstract class Entity<T> {
  protected readonly uuid: UniqueEntityID;
  protected readonly createdAt: Date;
  public readonly props: T;

  constructor(props: T, uuid?: UniqueEntityID) {
    this.props = props;
    this.uuid = uuid || new UniqueEntityID();
    this.createdAt = new Date();
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
