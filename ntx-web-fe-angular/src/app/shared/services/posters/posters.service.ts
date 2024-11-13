import { IPostersService } from './IPosters.service.interface';
import { HttpClient } from '@angular/common/http';
import { getBackdrop, getImageProxy, getPoster } from '@ntx-shared/config/api-endpoints';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class PosterService implements IPostersService {
  constructor(private readonly http: HttpClient) {}

  getPoster(id: string, size: string): Observable<Blob> {
    const url = getPoster(id, size);

    return this.http.get(url, { responseType: 'blob' });
  }

  getBackdrop(id: string): Observable<Blob> {
    const url = getBackdrop(id);

    return this.http.get(url, { responseType: 'blob' });
  }

  downloadImage(imgUrl: string): Observable<Blob> {
    const url = getImageProxy(imgUrl);

    return this.http.get(url, { responseType: 'blob' });
  }
}
