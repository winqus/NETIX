import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, map, Observable, of } from 'rxjs';
import { getUploadMovieUrl } from '@ntx-shared/config/api-endpoints';
import { IUploadService as IMovieService } from './IMovie.interface';
import { MediaItem } from '@ntx-shared/models/mediaItem';
import { MediaItemMapper } from '@ntx-shared/mappers/mediaItemMapper';
import movieTestData from './movieTestData';
import { API_CONFIG } from '@ntx-shared/config/api-endpoints';
import WatchableVideoDTO from '@ntx-shared/models/watchableVideo.dto';
import { WatchableVideoDTOMapper } from '@ntx-shared/mappers/WatchableVideoDTOMapper';

@Injectable({
  providedIn: 'root',
})
export class MovieService implements IMovieService {
  constructor(private http: HttpClient) {}

  uploadMovieMetadata(formData: FormData): Observable<any> {
    const url = getUploadMovieUrl();
    const httpOptions = {};

    return this.http.post(url, formData, httpOptions);
  }

  getMovies(page = 1, limit = 20): Observable<MediaItem[]> {
    const videosUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.videos;

    const url = `${videosUrl}?page=${page}&limit=${limit}`;

    const httpOptions = {};

    return this.http.get<WatchableVideoDTO[]>(url, httpOptions).pipe(
      map((videos) => {
        return WatchableVideoDTOMapper.toMediaItemList(videos);
      })
    );
  }

  private __getTestMovies(): Observable<MediaItem[]> {
    const raw: any[] = movieTestData;

    return of(MediaItemMapper.toMediaItemList(raw)).pipe(
      delay(1000) // Simulates a network delay of 1 second
    );
  }
}
