import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface UploadConfig {
  imageFormats: string[];
  videoFormats: string[];
  maxImageSize: number;
  maxVideoSize: number;
  imageFormatsToExport: string;
}

@Injectable({
  providedIn: 'root',
})
export class MediaConfigService {
  private config: UploadConfig | null = null;
  defaultUploadConfig: UploadConfig = {
    imageFormats: ['.png', '.jpg', '.jpeg', '.webp'],
    videoFormats: ['.mkv'],
    maxImageSize: 2 * 1024 * 1024 * 1024,
    maxVideoSize: 10 * 1024 * 1024 * 1024,
    imageFormatsToExport: '.webp',
  };
  constructor() {
    this.fetchConfig();
  }

  fetchConfig(): Observable<UploadConfig> {
    if (!this.config) {
      // TODO Replace with actual API call to populate config data
      this.config = this.defaultUploadConfig;
    }

    return of(this.config);
  }

  getImageFormats(): string[] {
    return this.config!.imageFormats;
  }

  getImageFormatToStore(): string {
    return this.config!.imageFormatsToExport;
  }

  getVideoFormats(): string[] {
    return this.config!.videoFormats;
  }

  getMaxVideoSize(): number {
    return this.config!.maxVideoSize;
  }

  getMaxImageSize(): number {
    return this.config!.maxImageSize;
  }
}
