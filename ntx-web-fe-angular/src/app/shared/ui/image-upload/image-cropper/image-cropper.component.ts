import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { CropperComponent, AngularCropperjsModule } from 'angular-cropperjs';
import { ImageService } from '@ntx-shared/services/image.service';
import { MediaConstants } from '@ntx/app/shared/config/constants';

export interface InputProps {
  imageUrl?: string;
}

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [AngularCropperjsModule],
  templateUrl: './image-cropper.component.html',
})
export class ImageCropperComponent implements OnInit, OnChanges {
  @Input() props: InputProps = {};
  @Output() cropped = new EventEmitter<Blob>();

  @ViewChild('angularCropper')
  public angularCropper: CropperComponent = new CropperComponent();

  cropper: Cropper | undefined;
  cropperOptions: Cropper.Options;
  imageUrl: string | null = null;

  defaultProps: InputProps = {
    imageUrl: '',
  };

  constructor(public imageCropService: ImageService) {
    this.cropperOptions = this.imageCropService.getCropperConfig();
  }

  ngOnInit() {
    if (this.props.imageUrl) {
      this.imageUrl = this.props.imageUrl;
    }
  }

  ngOnChanges(): void {
    this.props = { ...this.defaultProps, ...this.props };
  }

  cropImg() {
    const canvasWidth = MediaConstants.image.maxHeight;
    const canvasHeight = canvasWidth * MediaConstants.image.aspectRatio;
    const imageQuality = 0.8;

    if (this.angularCropper.cropper) {
      const croppedCanvas = this.angularCropper.cropper.getCroppedCanvas({
        width: canvasWidth,
        height: canvasHeight,
      });

      croppedCanvas.toBlob(
        async (blob: Blob | null) => {
          if (blob) {
            this.cropped.emit(blob);
          }
        },
        MediaConstants.image.exportFileExtension,
        imageQuality
      );
    }
  }
}
