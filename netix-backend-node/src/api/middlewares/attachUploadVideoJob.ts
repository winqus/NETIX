import { NextFunction, Request, Response } from 'express';
import Container from 'typedi';
import { Logger } from 'winston';
import { NAMES } from '../../config/dependencies';
import IUploadVideoJobService from '../../services/IServices/IUploadVideoJobService';

const attachUploadVideoJob = async (req: Request, res: Response, next: NextFunction) => {
  const uploadId = req.params.uploadID;
  const userId = (req as any).user.id;

  if (!uploadId) {
    return res.status(400).send({ message: 'Upload ID is required.' });
  }

  if (!userId) {
    return res.status(400).send({ message: 'User is required.' });
  }

  try {
    const fullJobResult = await (Container.get(NAMES.SERVICES.UploadVideoJob) as IUploadVideoJobService).getPendingOrInProgressForUserByUploadID(
      userId,
      uploadId
    );

    if (fullJobResult.isFailure) {
      Container.get<Logger>(NAMES.Logger).error(`[attachUploadVideoJobInProgress]: Failed to get job: ${JSON.stringify(fullJobResult.errorValue())}`);

      return res.status(404).send({ message: 'Upload job does not exist.' });
    }

    (req as any).uploadJob = fullJobResult.getValue();
    (req as any).uploadID = fullJobResult.getValue().upload.uuid;

    return next();
  } catch (error) {
    console.error('Failed to check upload status:', error);

    return res.status(500).send({ message: 'Internal server error' });
  }
};

export default attachUploadVideoJob;
