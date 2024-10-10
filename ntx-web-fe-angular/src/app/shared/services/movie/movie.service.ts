import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getMovieUrl } from '@ntx-shared/config/api-endpoints';
import { IMovieService } from './IMovie.service.interface';
import { MovieDTOMapper } from '@ntx-shared/mappers/MovieDTO.mapper';
import { MovieDTO, UpdateMovieDTO } from '@ntx-shared/models/movie.dto';
import { catchError, delay, map, Observable, of, throwError } from 'rxjs';
import { testMovieFixture } from './movieTestData';

@Injectable({
  providedIn: 'root',
})
export class MovieService implements IMovieService {
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

  updateMovieMetadata(id: string, movieData: UpdateMovieDTO): Observable<MovieDTO> {
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

  getMovies(): Observable<MovieDTO[]> {
    const url = getMovieUrl();

    const httpOptions = {};

    return this.http.get(url, httpOptions).pipe(
      map((response: any) => {
        console.log(response);
        return MovieDTOMapper.anyToMovieDTOArray(response);
      }),
      catchError((error) => {
        console.error('Error fetching movie metadata:', error);
        return throwError(() => error);
      })
    );
  }
}
