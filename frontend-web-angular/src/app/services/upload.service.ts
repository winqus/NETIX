import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UploadConstraintsDTO } from '../models/uploadConstraints.dto';
import { API_CONFIG } from '../config/api-endpoints';
import { Observable } from 'rxjs';
import { PermissionRequestDTO, PermissionResponseDTO } from '../models/uploadPermission.dto';
import { UploadMetadataRequestDTO, UploadMetadataResponseDTO } from '../models/uploadMetadata.dto';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private baseUrl = API_CONFIG.baseUrl;

  public splitChunkProgress = new EventEmitter<number>();
  public sendChunkProgress = new EventEmitter<number>();

  constructor(private http: HttpClient) {}

  getConstraints(): Observable<UploadConstraintsDTO> {
    const endpoint = API_CONFIG.endpoints.uploadConstraints;
    const fullUrl = this.baseUrl + endpoint;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http.get<UploadConstraintsDTO>(fullUrl, httpOptions);
  }

  getPermision(file: File): Observable<PermissionResponseDTO> {
    const endpoint = API_CONFIG.endpoints.uploadPermission;
    const fullUrl = this.baseUrl + endpoint;

    const httpOptions = {};

    const body: PermissionRequestDTO = {
      fileName: file.name,
      fileSizeInBytes: file.size,
      mimeType: file.type || 'video/mp4',
      durationInSeconds: 900,
    };

    return this.http.post<PermissionResponseDTO>(fullUrl, body, httpOptions);
  }

  uploadChunks(chunks: Blob[], permission: PermissionResponseDTO) {
    const baseUrl = permission.uploadUrl;
    const httpOptions = {};
    const delay = 1000; // Delay in milliseconds, e.g., 1000ms = 1 second

    const uploadChunk = (index: number) => {
      if (index >= chunks.length) {
        return; // Stop when all chunks have been sent
      }

      const chunk = chunks[index];
      const formData = new FormData();
      formData.append('videoChunk', chunk);

      const fullUrl = `${baseUrl}/${index}`;
      const body = formData;

      this.http.post(fullUrl, body, httpOptions).subscribe({
        next: () => {
          this.sendChunkProgress.emit(1);
          setTimeout(() => uploadChunk(index + 1), delay); // Schedule next upload after a delay
        },
        error: (error) => {
          console.log(error);
        },
      });
    };

    uploadChunk(0); // Start uploading from the first chunk
  }

  uploadMetadata(uploadId: string, metadata: UploadMetadataRequestDTO): Observable<UploadMetadataResponseDTO> {
    const fullUrl = `${API_CONFIG.baseUrl}/upload/${uploadId}/metadata`;

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    const body = metadata;

    return this.http.put<UploadMetadataResponseDTO>(fullUrl, body, httpOptions);
  }

  async uploadThumbnail(uploadId: string, file: File): Promise<Observable<{ message: string }>> {
    const fullUrl = `${API_CONFIG.baseUrl}/upload/${uploadId}/thumbnail`;

    const httpOptions = {};

    const formData = new FormData();
    formData.append('thumbnail', file);

    const body = formData;

    return this.http.post<{ message: string }>(fullUrl, body, httpOptions);
  }

  splitVideoIntoChunks = async (file: File, permission: PermissionResponseDTO) => {
    const chunkCount = permission.totalChunksCount;
    const fileSize = file.size;
    const chunks: Blob[] = [];

    const chunkSize = Math.ceil(fileSize / chunkCount);

    for (let i = 0; i < chunkCount; i++) {
      const start = i * chunkSize;
      const end = Math.min(fileSize, (i + 1) * chunkSize);

      const chunk = file.slice(start, end);

      this.splitChunkProgress.emit(((i + 1) / chunkCount) * 100);

      chunks.push(chunk);
    }

    return chunks;
  };
}
