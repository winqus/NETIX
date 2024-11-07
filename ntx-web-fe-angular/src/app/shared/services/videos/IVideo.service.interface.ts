import { Observable } from 'rxjs';
import { VideoRequirementDTO } from '@ntx-shared/models/video.dto';

export interface IVideoService {
  getVideoRequirements(): Observable<VideoRequirementDTO>;
  uploadVideo(file: File, movieId: string, chunkSize: number): Promise<string>;
}
