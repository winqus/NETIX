import { NextFunction, Request, Response } from 'express';
import { UploadState } from '../../core/states/UploadState';
import FullUploadVideoJobDTO from '../../dto/FullUploadVideoJobDTO';

export function checkUploadState(states: UploadState[] = Object.values(UploadState)) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const job = (req as any).uploadJob as FullUploadVideoJobDTO;

    if (!job) {
      return res.status(400).send({ message: 'No upload job attached.' });
    }

    if (!states.includes(job.upload.state)) {
      return res.status(403).send({ message: `The upload job is not in an acceptable state. Required states: ${states.join(', ')}.` });
    }

    return next();
  };
}
