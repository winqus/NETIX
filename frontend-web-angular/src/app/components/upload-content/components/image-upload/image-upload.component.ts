import { Component, ElementRef, ViewChild } from '@angular/core';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { ImageCropService } from '@ntx/app/services/image-crop.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent extends FileUploadComponent {
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  imageUrl: string | null = null;
  imageCropped: boolean = false;

  constructor(private imageCropService: ImageCropService) {
    super();
  }

  override setFile(file: File): void {
    super.setFile(file);
    if (file) {
      this.imageUrl = URL.createObjectURL(file);

      setTimeout(() => {
        if (this.imageElement) {
          this.cropImage();
          this.imageCropped = true;
        }
      }, 100);
    }
  }

  cropImage() {
    if (this.imageElement) {
      this.imageCropService
        .autoCropImage(this.imageElement.nativeElement, 2 / 3)
        .then((blob) => {
          this.imageUrl = URL.createObjectURL(blob);
        })
        .catch((err) => console.error('Cropping failed:', err));
    }
  }
}
