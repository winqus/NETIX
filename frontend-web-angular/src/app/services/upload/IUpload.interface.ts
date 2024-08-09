import { Observable } from 'rxjs';

export interface IUploadService {
  uploadThumbnail(imageFile: File, contentId: string): Observable<any>;
  uploadVideo(videoFile: File, contentId: string): Observable<any>;
}
