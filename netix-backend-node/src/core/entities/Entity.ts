import UniqueEntityID from './UniqueEntityID';

export default abstract class Entity<T> {
  protected readonly _uuid: UniqueEntityID;
  public readonly props: T;

  constructor(props: T, uuid?: UniqueEntityID) {
    this.props = props;
    this._uuid = uuid || new UniqueEntityID();
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

    return this._uuid.equals(object._uuid);
  }
}
