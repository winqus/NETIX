import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../config/app-settings';
import Cropper from 'cropperjs';

@Injectable({
  providedIn: 'root',
})
export class ImageCropService {
  constructor() {}

  getCropperConfig(aspectRatio: number = APP_SETTINGS.ASPECT_RATIO_TWO_THIRDS): Cropper.Options {
    return {
      aspectRatio: aspectRatio,
      viewMode: 1,
      autoCropArea: 1,
      responsive: true, // Ensure the cropper is responsive
      scalable: true,
      zoomable: true,
    };
  }

  autoCropImage(imageElement: HTMLImageElement, formatToStore: string): Promise<Blob> {
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
            }, formatToStore);
          } catch (error) {
            reject(error);
          } finally {
            cropper.destroy();
          }
        },
      });
    });
  }
}
