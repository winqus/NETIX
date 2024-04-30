import { NextFunction, Request, Response } from 'express';

export default (req: Request, _res: Response, next: NextFunction) => {
  const fakeUserId = 'some-fake-user-id';
  // (req as any).user = { id: fakeUserId };
  (req as any).user = { id: fakeUserId };

  return next();
};
