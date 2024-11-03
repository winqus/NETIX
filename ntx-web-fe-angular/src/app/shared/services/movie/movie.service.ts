import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getMovieBackdropUrl, getMoviePosterUrl, getMoviePublishedUrl, getMovieUrl } from '@ntx-shared/config/api-endpoints';
import { IMovieService } from './IMovie.service.interface';
import { MovieDTOMapper } from '@ntx-shared/mappers/MovieDTO.mapper';
import { MovieDTO, UpdateMovieDTO } from '@ntx-shared/models/movie.dto';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '@ntx/environments/environment.development';

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
        if (environment.development) console.error('Error uploading movie metadata:', error);
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
        if (environment.development) console.error('Error fetching movie metadata:', error);
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
        return MovieDTOMapper.anyToMovieDTO(response);
      }),
      catchError((error) => {
        if (environment.development) console.error('Error update movie metadata:', error);
        return throwError(() => error);
      })
    );
  }

  getMovies(): Observable<MovieDTO[]> {
    const url = getMovieUrl();

    const httpOptions = {};

    return this.http.get(url, httpOptions).pipe(
      map((response: any) => {
        return MovieDTOMapper.anyToMovieDTOArray(response);
      }),
      catchError((error) => {
        if (environment.development) console.error('Error fetching movie metadata:', error);
        return throwError(() => error);
      })
    );
  }

  publishMovie(id: string): Observable<MovieDTO> {
    const url = getMoviePublishedUrl(id);

    const httpOptions = {};

    return this.http.put(url, httpOptions).pipe(
      map((response: any) => {
        return MovieDTOMapper.anyToMovieDTO(response);
      }),
      catchError((error) => {
        if (environment.development) console.error('Error publishing movie:', error);
        return throwError(() => error);
      })
    );
  }

  unpublishMovie(id: string): Observable<MovieDTO> {
    const url = getMoviePublishedUrl(id);

    const httpOptions = {};

    return this.http.delete(url, httpOptions).pipe(
      map((response: any) => {
        return MovieDTOMapper.anyToMovieDTO(response);
      }),
      catchError((error) => {
        if (environment.development) console.error('Error publishing movie:', error);
        return throwError(() => error);
      })
    );
  }

  updatePoster(id: string, formData: FormData): Observable<MovieDTO> {
    const url = getMoviePosterUrl(id);

    const httpOptions = {};

    return this.http.put(url, formData, httpOptions).pipe(
      map((response: any) => {
        if (environment.development) console.log(response);
        return MovieDTOMapper.anyToMovieDTO(response);
      }),
      catchError((error) => {
        if (environment.development) console.error('Error updating movie poster:', error);
        return throwError(() => error);
      })
    );
  }

  updateBackdrop(id: string, formData: FormData): Observable<MovieDTO> {
    const url = getMovieBackdropUrl(id);

    const httpOptions = {};

    return this.http.put(url, formData, httpOptions).pipe(
      map((response: any) => {
        if (environment.development) console.log(response);
        return MovieDTOMapper.anyToMovieDTO(response);
      }),
      catchError((error) => {
        if (environment.development) console.error('Error updating movie backdrop:', error);
        return throwError(() => error);
      })
    );
  }
}
