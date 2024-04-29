import { Router } from 'express';
import statusRoute from './statusRoute';
import uploadRoute from './uploadRoute';
import videoRoute from './videoRoute';

export default () => {
  const router = Router();

  statusRoute(router);

  uploadRoute(router);
  videoRoute(router);

  return router;
};
