import { Injectable } from '@angular/core';
import { getUploadThumbnail, getUploadVideo } from '@ntx/app/config/api-endpoints';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUploadService } from './IUpload.interface';

@Injectable({
  providedIn: 'root',
})
export class UploadService implements IUploadService {
  constructor(private http: HttpClient) {}

  uploadThumbnail(imageFile: File, contentId: string): Observable<any> {
    const url = getUploadThumbnail(contentId);
    const httpOptions = {};

    const body = new FormData();
    const imageBlob = new Blob([imageFile]);
    body.append('thumbnail', imageBlob, imageFile.name);

    return this.http.post(url, body, httpOptions);
  }

  uploadVideo(videoFile: File, contentId: string): Observable<any> {
    const url = getUploadVideo(contentId);

    const body = new FormData();
    body.append('video', videoFile, videoFile.name);

    return this.http.post(url, body, {
      headers: new HttpHeaders({
        Accept: '*/*',
      }),
      reportProgress: true,
      responseType: 'json',
    });
  }
}
