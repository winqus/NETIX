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

  autoCropImage(imageElement: HTMLImageElement, aspectRatio?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!imageElement) {
        reject(new Error('Image element is not provided'));
        return;
      }
      const cropper = new Cropper(imageElement, {
        ...this.getCropperConfig(aspectRatio),
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

  async getAverageColor(imgFile: File): Promise<{ r: number; g: number; b: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(imgFile);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Canvas not supported.');

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;

        let r = 0,
          g = 0,
          b = 0;
        const totalPixels = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }

        r = Math.round(r / totalPixels);
        g = Math.round(g / totalPixels);
        b = Math.round(b / totalPixels);

        URL.revokeObjectURL(img.src);
        resolve({ r, g, b });
      };

      img.onerror = () => {
        reject('Error loading image.');
      };
    });
  }
}
