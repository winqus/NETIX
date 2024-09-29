import { Injectable } from '@angular/core';
import { MediaConstants } from '../config/constants';
import Cropper from 'cropperjs';
import imageCompression from 'browser-image-compression';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor() {}

  getCropperConfig(aspectRatio: number = MediaConstants.image.aspectRatio): Cropper.Options {
    return {
      aspectRatio: aspectRatio,
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
      scalable: true,
      zoomable: true,
    };
  }

  autoCropImage(imageElement: HTMLImageElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!imageElement) {
        reject(new Error('Image element is not provided'));
        return;
      }

      const cropper = new Cropper(imageElement, {
        ...this.getCropperConfig(),
        ready() {
          try {
            const croppedCanvas = cropper.getCroppedCanvas();
            croppedCanvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create Blob'));
              }
            });
          } catch (error) {
            reject(error);
          } finally {
            cropper.destroy();
          }
        },
      });
    });
  }

  async compressImage(imageFile: File) {
    if (imageFile.size < MediaConstants.image.maxSizeBytes) return imageFile;
    const options = {
      maxSizeMB: MediaConstants.image.maxSizeMb,
      maxWidthOrHeight: MediaConstants.image.maxHeight,
      useWebWorker: true,
    };
    return imageCompression(imageFile, options);
  }
}
