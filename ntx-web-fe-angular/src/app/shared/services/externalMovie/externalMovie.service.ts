import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { getExternalMovie } from '@ntx-shared/config/api-endpoints';
import { IExternalMovieService } from './IExternalMovie.service.interface';
import { ExternalMovieDTO } from '@ntx-shared/models/externalMovie.dto';
import { ExternalMovieDTOMapper } from '@ntx-shared/mappers/ExternalMovieDTO.mapper';

@Injectable({
  providedIn: 'root',
})
export class ExternalMovieService implements IExternalMovieService {
  constructor(private readonly http: HttpClient) {}

  getExternalMovieMetadata(id: string, providerId: string): Observable<ExternalMovieDTO> {
    const url = getExternalMovie(id, providerId);
    const httpOptions = {};

    return this.http.get(url, httpOptions).pipe(
      map((response: any) => {
        return ExternalMovieDTOMapper.anyToExternalMovieDTO(response);
      }),
      catchError((error) => {
        console.error('Error fetching external movie metadata:', error);
        return throwError(() => error);
      })
    );
  }
}
