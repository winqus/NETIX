import { Component, ElementRef, ViewChild } from '@angular/core';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { ImageCropService } from '@ntx/app/services/image-crop.service';
import { MediaConfigService } from '@ntx/app/services/mediaConfig.service';
import { SvgIconsComponent } from '@ntx/app/components/shared/svg-icons/svg-icons.component';
import { ImageCropperComponent } from '../image-cropper/image-cropper.component';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [SvgIconsComponent, ImageCropperComponent],
  templateUrl: './image-upload.component.html',
})
export class ImageUploadComponent extends FileUploadComponent {
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('croppModal') croppModal!: ElementRef<HTMLDialogElement>;

  originalImgUrl: string | null = null;
  imageUrl: string | null = null;
  imageCropped: boolean = false;

  constructor(
    private imageCropService: ImageCropService,
    private mediaConfig: MediaConfigService
  ) {
    super();
  }

  override setFile(file: File): void {
    super.setFile(file);
    if (file) {
      this.originalImgUrl = URL.createObjectURL(file);
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
        .autoCropImage(this.imageElement.nativeElement, this.mediaConfig.getImageFormatToStore())
        .then((blob) => {
          this.imageUrl = URL.createObjectURL(blob);
        })
        .catch((err) => console.error('Cropping failed:', err));
    }
  }

  setCropedImage(croppedUrl: string) {
    this.imageUrl = croppedUrl;
    this.closeCropperModal();
  }

  closeCropperModal() {
    if (this.croppModal) {
      this.croppModal.nativeElement.close();
    }
  }

  override clearFileInput(event: Event) {
    super.clearFileInput(event);

    this.imageUrl = '';
    this.isDraggingOver = false;
  }
}
