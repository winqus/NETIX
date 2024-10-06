import { Observable } from 'rxjs/internal/Observable';
import { ExternalMovieDTO } from '@ntx-shared/models/externalMovie.dto';

export interface IExternalMovieService {
  getExternalMovieMetadata(id: string, providerId: string): Observable<ExternalMovieDTO>;
}
