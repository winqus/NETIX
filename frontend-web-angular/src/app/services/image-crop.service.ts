import { Injectable } from '@angular/core';
import { MediaConfigService } from './media-config.service';
import Cropper from 'cropperjs';

@Injectable({
  providedIn: 'root',
})
export class ImageCropService {
  constructor(private mediaConfig: MediaConfigService) {}

  autoCropImage(imageElement: HTMLImageElement, aspectRatio: number = 2 / 3): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!imageElement) {
        reject(new Error('Image element is not provided'));
        return;
      }

      const formatToStore = this.mediaConfig.getImageFormatToStore();

      const cropper = new Cropper(imageElement, {
        aspectRatio: aspectRatio,
        viewMode: 1,
        autoCropArea: 1,
        background: false,
        movable: false,
        zoomable: false,
        cropBoxResizable: false,
        center: true,
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
