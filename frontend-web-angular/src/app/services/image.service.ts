import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../config/app-settings';
import Cropper from 'cropperjs';
import imageCompression from 'browser-image-compression';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor() {}

  getCropperConfig(aspectRatio: number = APP_SETTINGS.ASPECT_RATIO_TWO_THIRDS): Cropper.Options {
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
    const options = {
      maxSizeMB: APP_SETTINGS.MAX_IMAGE_SIZE_MB,
      maxWidthOrHeight: APP_SETTINGS.MAX_IMAGE_HEIGHT,
      useWebWorker: true,
    };
    return await imageCompression(imageFile, options);
  }
}
