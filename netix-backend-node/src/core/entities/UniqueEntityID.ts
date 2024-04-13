import { v4 as uuidv4 } from 'uuid';

export default class UniqueEntityID {
  private _value: string;

  get value(): string {
    return this._value;
  }

  constructor(id?: string) {
    this._value = id ? id : uuidv4();
  }

  toString(): string {
    return this._value;
  }

  equals(id: UniqueEntityID): boolean {
    return this._value === id.value;
  }
}
