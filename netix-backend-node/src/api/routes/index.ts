import { Router } from 'express';
import statusRoute from './statusRoute';
import uploadRoute from './uploadRoute';

export default () => {
  const router = Router();

  statusRoute(router);

  uploadRoute(router);

  return router;
};
