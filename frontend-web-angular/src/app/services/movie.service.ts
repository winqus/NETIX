import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Video } from '../models/video';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  constructor() {}

  getMovies(): Observable<Video[]> {
    const movies: Video[] = [
      {
        id: '1',
        title: 'Inception',
        publishedAt: new Date('2010-11-07'),
        duration: 10140,
        thumbnails: {
          default: 'https://fastly.picsum.photos/id/986/700/900.jpg?hmac=Z6XTg0SLdISSLjJxY7L15daSPBlIl0is-pHMS2sGDCo',
        },
      },
      {
        id: '2',
        title: 'Interstellar',
        publishedAt: new Date('2014-11-07'),
        duration: 10140,
        thumbnails: {
          default: 'https://fastly.picsum.photos/id/410/700/900.jpg?hmac=7bkyN8_CkLEpktiIL8SQj9YV2-Bgv-u3AIkBsMhDQSM',
        },
      },
      {
        id: '3',
        title: 'The Matrix',
        publishedAt: new Date('1999-11-07'),
        duration: 9140,
        thumbnails: {
          default: 'https://fastly.picsum.photos/id/729/700/900.jpg?hmac=dkrDGdKLxPWTVcfUtk9oBeviL3snwldFOMo9QG5f1EU',
        },
      },
      {
        id: '4',
        title: 'Pulp Fiction',
        publishedAt: new Date('1994-11-07'),
        duration: 10000,
        thumbnails: {
          default: 'https://fastly.picsum.photos/id/172/700/900.jpg?hmac=j92ReRNGl367wrJYLhaSHNa61DFyORGCaSqWWSUooqw',
        },
      },
      {
        id: '5',
        title: 'Blade Runner 2049',
        publishedAt: new Date('2017-11-07'),
        duration: 9890,
        thumbnails: {
          default: 'https://fastly.picsum.photos/id/344/700/900.jpg?hmac=XwfWpOhCSDOwm7KOpSCD8s7dZCJMTInlxl2k48xQNow',
        },
      },
    ];

    return of(movies).pipe(
      delay(5000) // Simulates a network delay of 1 second
    );
  }
}
