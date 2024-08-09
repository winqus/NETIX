import { Component, ElementRef, ViewChild } from '@angular/core';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { ImageService } from '@ntx/app/services/image.service';
import { MediaConfigService } from '@ntx/app/services/mediaConfig.service';
import { SvgIconsComponent } from '@ntx/app/components/shared/components/svg-icons/svg-icons.component';
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
  image: File | null = null;
  imageUrl: string | null = null;
  imageCropped: boolean = false;

  constructor(
    private imageService: ImageService,
    private mediaConfig: MediaConfigService
  ) {
    super();
  }

  override setFile(file: File): void {
    super.setFile(file);
    if (file) {
      this.image = file;
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

  setImage(blob: Blob) {
    const croppedFile = new File([blob], 'th.' + this.mediaConfig.getImageExportFormat(), {
      type: 'image/' + this.mediaConfig.getImageExportFormat(),
      lastModified: Date.now(),
    });

    this.filePassed.emit(croppedFile);
    this.image = croppedFile;
    this.imageUrl = URL.createObjectURL(blob);
  }

  cropImage() {
    if (this.imageElement) {
      this.imageService
        .autoCropImage(this.imageElement.nativeElement)
        .then((blob) => {
          this.setImage(blob);
        })
        .catch((err) => console.error('Cropping failed:', err));
    }
  }

  setCropedImage(blob: Blob) {
    this.setImage(blob);

    this.closeCropperModal();
  }

  closeCropperModal() {
    if (this.croppModal) {
      this.croppModal.nativeElement.close();
    }
  }

  override clearFileInput(event: Event) {
    super.clearFileInput(event);
    this.clearFile();
  }

  override clearFile() {
    super.clearFile();

    this.imageUrl = '';
    this.isDraggingOver = false;
  }
}
