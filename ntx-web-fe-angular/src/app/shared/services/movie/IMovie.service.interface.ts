import { Observable } from 'rxjs';
import { MovieDTO } from '@ntx-shared/models/movie.dto';

export interface IMovieService {
  uploadMovieMetadata(formData: FormData): Observable<MovieDTO>;
  getMovieMetadata(id: string): Observable<MovieDTO>;
}
