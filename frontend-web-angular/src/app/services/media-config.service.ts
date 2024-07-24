import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MediaConfigService {
  constructor() {}

  // Mock method to get image formats
  getImageFormats(): string {
    return 'image/png, image/jpeg, image/webp';
  }

  // Mock method to get image format to store
  getImageFormatToStore(): string {
    return 'image/webp';
  }

  // Mock method to get video formats
  getVideoFormats(): string {
    return 'video/x-matroska';
  }

  // Mock method to get maximum video size (in bytes)
  getMaxVideoSize(): number {
    return 10 * 1024 * 1024 * 1024; // 10GB
  }
}
