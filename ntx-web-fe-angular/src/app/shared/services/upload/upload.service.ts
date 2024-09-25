import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { getMovieUrl } from '@ntx-shared/config/api-endpoints';
import { IUploadService } from './IUpload.interface';
import { MovieDTO } from '../../models/movie.dto';
import { MovieDTOMapper } from '../../mappers/MovieDTO.mapper';

@Injectable({
  providedIn: 'root',
})
export class UploadService implements IUploadService {
  constructor(private http: HttpClient) {}

  uploadMovieMetadata(formData: FormData): Observable<any> {
    const url = getMovieUrl();
    const httpOptions = {};

    return this.http.post(url, formData, httpOptions);
  }

  getMovieMetadata(id: string): Observable<MovieDTO> {
    const url = getMovieUrl(id);
    const httpOptions = {};

    return this.http.get(url, httpOptions).pipe(
      map((response: any) => {
        return MovieDTOMapper.toMetadataItem(response);
      }),
      catchError((error) => {
        console.error('Error fetching movie metadata:', error);
        return throwError(() => error);
      })
    );
  }
}
