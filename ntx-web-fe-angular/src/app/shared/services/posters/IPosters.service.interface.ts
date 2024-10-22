import { Observable } from 'rxjs';

export interface IPostersService {
  getPoster(id: string, size: string): Observable<Blob>;

  downloadImage(url: string): Observable<Blob>;
}
