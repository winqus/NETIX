import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { IVideoService } from './IVideo.service.interface';
import { VideoDTO, VideoRequirementDTO } from '@ntx-shared/models/video.dto';
import { getVideo, getVideoRequirementsUrl, getVideoUpload } from '@ntx-shared/config/api-endpoints';
import { environment } from '@ntx/environments/environment.development';
import { VideoDTOMapper, VideoRequirementDTOMapper } from '@ntx-shared/mappers/VideoDTO.mapper';
import * as tus from 'tus-js-client';
import { JwtService } from '@ntx/app/auth/jwt.service';

@Injectable({
  providedIn: 'root',
})
export class VideoService implements IVideoService {
  private uploadProgressSubject = new BehaviorSubject<number>(0);
  uploadProgress$ = this.uploadProgressSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly jwt: JwtService
  ) {}

  getVideoRequirements(): Observable<VideoRequirementDTO> {
    const url = getVideoRequirementsUrl();
    const httpOptions = {};

    return this.http.get(url, httpOptions).pipe(
      map((response: any) => {
        return VideoRequirementDTOMapper.anyToVideoRequirementDTO(response);
      }),
      catchError((error) => {
        if (environment.development) console.error('Error getting video requirements:', error);
        return throwError(() => error);
      })
    );
  }

  getVideoPropsUrl(id: string): Observable<VideoDTO> {
    const url = getVideo(id);
    const httpOptions = {};

    return this.http.get(url, httpOptions).pipe(
      map((response: any) => {
        return VideoDTOMapper.anyToVideoDTO(response);
      }),
      catchError((error) => {
        if (environment.development) console.error('Error getting video metadata:', error);
        return throwError(() => error);
      })
    );
  }

  uploadVideo(file: File, movieId: string, chunkSize: number = 100000000): Promise<string> {
    const endpoint = getVideoUpload(movieId);
    const parallelUploads = 1;

    this.uploadProgressSubject.next(0);

    return new Promise((resolve, reject) => {
      const upload = new tus.Upload(file, {
        headers: {
          Authorization: `Bearer ${this.jwt.getToken()}`,
        },
        endpoint,
        chunkSize,
        retryDelays: [0, 1000, 3000, 5000],
        parallelUploads,
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: (error: any) => {
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = (bytesUploaded / bytesTotal) * 100;
          this.uploadProgressSubject.next(percentage);
        },
        onSuccess: () => {
          this.uploadProgressSubject.complete();
          this.uploadProgressSubject = new BehaviorSubject<number>(0);
          this.uploadProgress$ = this.uploadProgressSubject.asObservable();
          resolve(upload.url!);
        },
      });

      upload.start();
    });
  }
}
