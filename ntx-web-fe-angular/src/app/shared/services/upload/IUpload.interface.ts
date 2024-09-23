import { Observable } from 'rxjs';

export interface IUploadService {
  uploadMovieMetadata(formData: FormData): Observable<any>;
}
