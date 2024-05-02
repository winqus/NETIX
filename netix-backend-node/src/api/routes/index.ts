import { Router } from 'express';
import statusRoute from './statusRoute';
import thumbnailRoute from './thumbnailRoute';
import uploadRoute from './uploadRoute';
import videoRoute from './videoRoute';

export default () => {
  const router = Router();

  statusRoute(router);

  uploadRoute(router);
  videoRoute(router);
  thumbnailRoute(router);

  return router;
};
