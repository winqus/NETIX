import { Router } from 'express';
import status from './statusRoute';
import video from './videoRoute';

export default () => {
  const router = Router();

  status(router);
  video(router);

  return router;
};
