import { NextFunction, Request, Response } from 'express';

// TODO: Implement propper authentication middleware with OAuth2 or JWT
const fakeAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');
  const fakeToken = 'some.fake-jwt.token';

  if (!token) {
    return res.status(401).send('Unauthorized');
  }

  if (!token.startsWith('Bearer ')) {
    return res.status(400).send('Malformed token');
  }

  if (token !== `Bearer ${fakeToken}`) {
    return res.status(403).send('Forbidden');
  }

  return next();
};

export default fakeAuthenticate;
