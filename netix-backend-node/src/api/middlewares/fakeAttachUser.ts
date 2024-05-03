import { NextFunction, Request, Response } from 'express';

const attachUser = (req: Request, _res: Response, next: NextFunction) => {
  const fakeUserId = 'some-fake-user-id';

  (req as any).user = { id: fakeUserId };

  return next();
};

export default attachUser;
