import * as uuid from 'uuid';

export const isValidUUID = (uuidToCheck: string): boolean => {
  return uuid.validate(uuidToCheck);
};
