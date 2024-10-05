import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { getMovieUrl } from '@ntx-shared/config/api-endpoints';
import { IUploadService } from './IUpload.service.interface';
import { MovieData, MovieDTO } from '@ntx-shared/models/movie.dto';
import { MovieDTOMapper } from '@ntx-shared/mappers/MovieDTO.mapper';

@Injectable({
  providedIn: 'root',
})
export class UploadService implements IUploadService {
  constructor(private readonly http: HttpClient) {}

  uploadMovieMetadata(formData: FormData): Observable<MovieDTO> {
    const url = getMovieUrl();
    const httpOptions = {};

    return this.http.post(url, formData, httpOptions).pipe(
      map((response: any) => {
        return MovieDTOMapper.anyToMovieDTO(response);
      }),
      catchError((error) => {
        console.error('Error fetching movie metadata:', error);
        return throwError(() => error);
      })
    );
  }

  updateMovieMetadata(id: string, movieData: MovieData): Observable<MovieDTO> {
    const url = getMovieUrl(id);
    const httpOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return this.http.patch(url, movieData, httpOptions).pipe(
      map((response: any) => {
        console.log(response);
        return MovieDTOMapper.anyToMovieDTO(response);
      }),
      catchError((error) => {
        console.error('Error fetching movie metadata:', error);
        return throwError(() => error);
      })
    );
  }

  getMovieMetadata(id: string): Observable<MovieDTO> {
    const url = getMovieUrl(id);
    const httpOptions = {};

    return this.http.get(url, httpOptions).pipe(
      map((response: any) => {
        return MovieDTOMapper.anyToMovieDTO(response);
      }),
      catchError((error) => {
        console.error('Error fetching movie metadata:', error);
        return throwError(() => error);
      })
    );
  }
}
