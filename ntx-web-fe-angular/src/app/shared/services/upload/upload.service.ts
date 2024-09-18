import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getUploadMovieMetadataUrl } from '@ntx-shared/config/api-endpoints';
import { IUploadService } from './IUpload.interface';

@Injectable({
  providedIn: 'root',
})
export class UploadService implements IUploadService {
  constructor(private http: HttpClient) {}

  uploadMovieMetadata(formData: FormData): Observable<any> {
    const url = getUploadMovieMetadataUrl();
    const httpOptions = {};

    return this.http.post(url, formData, httpOptions);
  }
}
