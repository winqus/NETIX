import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

/**
 * Generic function to create and validate an instance of a class.
 * @param cls - The class constructor.
 * @param obj - The plain object to transform and validate.
 * @returns A promise that resolves to an instance of the class.
 */
export async function createValidatedObject<T extends object>(cls: new (...args: any[]) => T, obj: any): Promise<T> {
  const instance = plainToInstance(cls, obj);

  await validateOrReject(instance);

  return instance;
}
