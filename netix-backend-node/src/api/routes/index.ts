import { Router } from 'express';
import status from './status';

export default () => {
  const router = Router();

  status(router);

  return router;
};
