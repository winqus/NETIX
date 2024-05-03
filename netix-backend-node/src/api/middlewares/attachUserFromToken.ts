import { NextFunction, Request, Response } from 'express';

const attachUser = (req: Request, res: Response, next: NextFunction) => {
  (req as any).user = { id: req.auth?.payload?.sub };

  if (!req.auth?.payload?.sub) {
    res.status(401).send({ message: 'No user id in token' });
  }

  return next();
};

export default attachUser;
