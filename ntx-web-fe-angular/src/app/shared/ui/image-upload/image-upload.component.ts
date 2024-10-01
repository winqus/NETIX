import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { generateRandomId } from '@ntx-shared/services/utils/utils';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';
import { MediaConstants } from '@ntx-shared/config/constants';
import { ImageService } from '@ntx-shared/services/image.service';
import { ImageCropperComponent } from '@ntx-shared/ui/image-upload/image-cropper/image-cropper.component';
import { environment } from '@ntx/environments/environment.development';

export interface InputProps {
  title?: string;
  accept?: string;
  readonly?: boolean;
}

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [SvgIconsComponent, ImageCropperComponent],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent implements OnInit, OnChanges {
  @Input() props: InputProps = {};
  @Output() filePassed = new EventEmitter<File | null>();
  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;
  @ViewChild('image') imageElement!: ElementRef<HTMLImageElement>;
  @ViewChild('croppModal') croppModal!: ElementRef<HTMLDialogElement>;

  fileUploadId: string = '';
  isDraggingOver: boolean = false;

  defaultProps: InputProps = {
    title: 'Upload File',
    accept: '',
    readonly: false,
  };

  originalImage: File | null = null;
  croppedImage: File | null = null;

  originalImgUrl: string | null = null;
  imageUrl: string | null = null;

  constructor(private imageServ: ImageService) {}

  ngOnInit() {
    if (!this.fileUploadId) {
      this.fileUploadId = `file-upload-${generateRandomId()}`;
      console.log(this.fileUploadId);
    }
  }

  ngOnChanges(): void {
    this.props = { ...this.defaultProps, ...this.props };
  }

  onFileChanged(event: any) {
    const newFile = event.target.files[0] as File;

    if (newFile == undefined) return;

    this.setFile(newFile);
  }

  setCropedImage(blob: Blob) {
    this.setCroppedImage(blob);

    if (this.croppModal) {
      this.croppModal.nativeElement.close();
    }
  }

  clearFile(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    if (this.inputElement) {
      this.inputElement.nativeElement.value = '';
    }

    this.imageUrl = '';
    this.originalImgUrl = '';
    this.originalImage = null;
    this.croppedImage = null;

    this.emitFile();
  }

  private imageProcessing() {
    this.imageServ
      .autoCropImage(this.imageElement.nativeElement)
      .then((blob) => {
        this.setCroppedImage(blob);
      })
      .catch((err) => {
        if (environment.development) console.error('Cropping failed:', err);
      });
  }
  private setFile(file: File) {
    this.originalImage = file;
    this.originalImgUrl = URL.createObjectURL(this.originalImage);
    this.imageUrl = this.originalImgUrl;

    setTimeout(() => {
      if (this.imageElement) {
        this.imageProcessing();
      }
    }, 100);
  }

  private async setCroppedImage(blob: Blob) {
    this.croppedImage = await this.createCroppedImageFile(blob);
    this.emitFile();
  }

  private async createCroppedImageFile(blob: Blob): Promise<File> {
    const croppedImage = new File([blob], 'th.' + MediaConstants.image.exportFileExtension, {
      type: MediaConstants.image.exportMimeType,
      lastModified: Date.now(),
    });

    const compressedFile = await this.imageServ.compressImage(croppedImage);

    this.imageUrl = URL.createObjectURL(compressedFile);

    return compressedFile;
  }

  private emitFile() {
    if (environment.development) console.log(this.croppedImage);
    this.filePassed.emit(this.croppedImage);
  }

  private isFileTypeAccepted(file: File): boolean {
    if (!this.props.accept) {
      return true;
    }

    const acceptedTypes = this.props.accept.split(',').map((type) => type.trim());
    const fileType = file.type;
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    return acceptedTypes.some((acceptType) => {
      if (acceptType.startsWith('.')) {
        return fileExtension === acceptType.substring(1).toLowerCase();
      } else {
        return fileType === acceptType || fileType.startsWith(`${acceptType.split('/')[0]}/`);
      }
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length && !this.props.readonly) {
      const file = event.dataTransfer.files[0];
      if (this.isFileTypeAccepted(file)) {
        this.setFile(file);
      }
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = false;
  }
}
