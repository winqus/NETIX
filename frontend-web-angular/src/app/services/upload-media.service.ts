import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
// import { HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadMediaService {
  // chunkProgress: number = 0;
  totalProgress: number = 0;
  CHUNK_SIZE = 150 * 1024 * 1024; // 100MB chunk size
  totalChunks?: number;
  fileMediaName?: string;
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

  uploadFile(file: File) {
    this.totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
    this.fileMediaName = Math.random().toString(36).slice(-6) + file.name;
  }

  uploadFileChunk(file: File, url: string, chunk: number): Observable<HttpEvent<any>> {
    if (this.totalChunks != null && this.fileMediaName != null) {
      const CHUNK = file.slice(chunk * this.CHUNK_SIZE, (chunk + 1) * this.CHUNK_SIZE);
      const formData: FormData = new FormData();

      formData.append('file', CHUNK);
      formData.append('chunk', String(chunk));
      formData.append('chunks', String(this.totalChunks));
      formData.append('originalname', this.fileMediaName);

      const req = new HttpRequest('POST', url, formData, {
        reportProgress: true,
        responseType: 'json',
      });
      return new Observable((subscriber) => {
        const subscription = this.http.request(req).subscribe({
          next: (event) => subscriber.next(event),
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        });
        return () => subscription.unsubscribe();
      });
    }
    return throwError(() => new Error('Total chunks or file media name is not set.'));
  }
}
