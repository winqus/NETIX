import { Component, ElementRef, ViewChild } from '@angular/core';
import { ImageService } from '@ntx-shared/services/image.service';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';
import { FileUploadComponent } from '@ntx-pages/create-title/upload-title/components/file-upload/file-upload.component';
import { ImageCropperComponent } from '@ntx-pages/create-title/upload-title/components/image-cropper/image-cropper.component';
import { MediaConstants as MediaConstants } from '@ntx/app/shared/config/constants';

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

  constructor(private imageService: ImageService) {
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
    const croppedFile = new File([blob], 'th.' + MediaConstants.image.exportFormat, {
      type: 'image/' + MediaConstants.image.exportFormat,
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
