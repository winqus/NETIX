export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean;
  public error: T | string | null;
  private _value: T | null;

  public constructor(isSuccess: boolean, error?: T | string, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error || null;
    this._value = value || null;

    Object.freeze(this);
  }
  public getValue(): T {
    if (!this.isSuccess) {
      console.error(this.error);
      throw new Error("Can't get the value of an error result. Use 'errorValue' instead.");
    }

    if (this._value === null) {
      throw new Error('No value present.');
    }

    return this._value;
  }
  public errorValue(): T | string | null {
    return this.error;
  }
  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }
  public static fail<U>(error: any): Result<U> {
    return new Result<U>(false, error);
  }
  public static combine(results: Result<any>[]): Result<any> {
    for (const result of results) {
      if (result.isFailure) {
        return result;
      }
    }

    return Result.ok();
  }
}
