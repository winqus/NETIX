import { Request } from 'express';
import FullUploadVideoJobDTO from '../../dto/FullUploadVideoJobDTO';

export default interface HttpUploadRequest extends Request {
  user?: { id: string };
  uploadJob?: FullUploadVideoJobDTO;
}
