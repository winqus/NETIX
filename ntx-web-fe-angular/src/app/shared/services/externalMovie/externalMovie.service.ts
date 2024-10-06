import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { getExternalMovie, getMovieImporteUrl, replacePoster } from '@ntx-shared/config/api-endpoints';
import { IExternalMovieService } from './IExternalMovie.service.interface';
import { ExternalMovieDTO } from '@ntx-shared/models/externalMovie.dto';
import { ExternalMovieDTOMapper } from '@ntx-shared/mappers/ExternalMovieDTO.mapper';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { MovieDTOMapper } from '@ntx-shared/mappers/MovieDTO.mapper';

@Injectable({
  providedIn: 'root',
})
export class ExternalMovieService implements IExternalMovieService {
  constructor(private readonly http: HttpClient) {}
  uploadExternalMovieMetadata(title: any): Observable<MovieDTO> {
    const url = getMovieImporteUrl();
    const httpOptions = {};

    return this.http.post(url, title, httpOptions).pipe(
      map((response: any) => {
        return MovieDTOMapper.anyToMovieDTO(response);
      }),
      catchError((error) => {
        console.error('Error uploading movie metadata:', error);
        return throwError(() => error);
      })
    );
  }
  replaceExternalMoviePoster(id: string, formData: FormData): Observable<MovieDTO> {
    const url = replacePoster(id);
    const httpOptions = {};

    return this.http.put(url, formData, httpOptions).pipe(
      map((response: any) => {
        return MovieDTOMapper.anyToMovieDTO(response);
      }),
      catchError((error) => {
        console.error('Error fetching movie metadata:', error);
        return throwError(() => error);
      })
    );
  }
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
