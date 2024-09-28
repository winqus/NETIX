import { Observable } from 'rxjs';
import { MovieDTO } from '../../models/movie.dto';

export interface IUploadService {
  uploadMovieMetadata(formData: FormData): Observable<any>;
  getMovieMetadata(id: string): Observable<MovieDTO>;
}
