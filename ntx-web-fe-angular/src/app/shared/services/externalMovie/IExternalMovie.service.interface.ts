import { Observable } from 'rxjs/internal/Observable';
import { ExternalMovieDTO, ExternalTitleDTO } from '@ntx-shared/models/externalMovie.dto';
import { MovieDTO } from '../../models/movie.dto';

export interface IExternalMovieService {
  uploadExternalMovieMetadata(title: ExternalTitleDTO): Observable<MovieDTO>;
  getExternalMovieMetadata(id: string, providerId: string): Observable<ExternalMovieDTO>;
}
