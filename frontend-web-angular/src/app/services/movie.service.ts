import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { MediaItem } from '../models/mediaItem';
import { MediaItemMapper } from '../mappers/mediaItemMapper';
import movieTestData from './movieTestData';
import { API_CONFIG } from '../config/api.config';
import { HttpClient } from '@angular/common/http';
import WatchableVideoDTO from '../models/watchableVideo.dto';
import { WatchableVideoDTOMapper } from '../mappers/WatchableVideoDTOMapper';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  constructor(private http: HttpClient) {}

  getMovies(page = 1, limit = 10): Observable<MediaItem[]> {
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
