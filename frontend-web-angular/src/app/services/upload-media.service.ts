import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
// import { HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadMediaService {
  constructor(private http: HttpClient) {}

  uploadSmallFile(file: File, url: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    console.log(formData.get('file'));

    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request(req);
  }

  async uploadFile(file: File, url: string): Promise<Observable<HttpEvent<any>>[]> {
    const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB chunk size
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    // const chunkProgress = 100 / totalChunks;
    // Random identifier if user uploads the same named file
    const fileName = Math.random().toString(36).slice(-6) + file.name;

    const requests: Observable<HttpEvent<any>>[] = [];

    for (let chunk = 0; chunk < totalChunks; chunk++) {
      const CHUNK = file.slice(chunk * CHUNK_SIZE, (chunk + 1) * CHUNK_SIZE);
      const formData: FormData = new FormData();
      formData.append('file', CHUNK);
      formData.append('chunk', String(chunk));
      formData.append('chunks', String(totalChunks));
      formData.append('originalname', fileName);

      const req = new HttpRequest('POST', url, formData, {
        reportProgress: true,
        responseType: 'json',
      });
      console.log((chunk + 1).toString() + '/' + totalChunks.toString());
      console.log(req);

      requests.push(this.http.request(req));
    }
    return requests;
  }
}
