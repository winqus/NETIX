import { Observable } from 'rxjs';
import { IPostersService } from './IPosters.service.interface';
import { HttpClient } from '@angular/common/http';
import { getPoster } from '../../config/api-endpoints';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PosterService implements IPostersService {
  constructor(private readonly http: HttpClient) {}

  getPoster(id: string, size: string): Observable<Blob> {
    const url = getPoster(id, size);

    return this.http.get(url, { responseType: 'blob' });
  }
}
