import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { CropperComponent, AngularCropperjsModule } from 'angular-cropperjs';
import { ImageService } from '@ntx-shared/services/image.service';
import { MediaConstants } from '@ntx/app/shared/config/constants';

export interface InputProps {
  imageUrl?: string;
  aspectRatio?: number;
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
  cropperOptions: Cropper.Options | undefined;
  imageUrl: string | null = null;

  defaultProps: InputProps = {
    imageUrl: '',
    aspectRatio: undefined,
  };

  constructor(public imageCropService: ImageService) {}

  ngOnInit() {
    this.updateProps();
  }

  ngOnChanges(): void {
    this.updateProps();
  }

  updateProps() {
    this.props = { ...this.defaultProps, ...this.props };

    if (this.props.imageUrl) {
      this.imageUrl = this.props.imageUrl;
    }

    if (this.props.aspectRatio) {
      this.cropperOptions = this.imageCropService.getCropperConfig(this.props.aspectRatio);
    } else {
      this.cropperOptions = this.imageCropService.getCropperConfig();
    }
  }

  cropImg() {
    const canvasWidth = MediaConstants.image.maxHeight;
    const canvasHeight = canvasWidth * MediaConstants.image.aspectRatio;

    if (this.angularCropper.cropper) {
      const croppedCanvas = this.angularCropper.cropper.getCroppedCanvas({
        width: canvasWidth,
        height: canvasHeight,
      });

      croppedCanvas.toBlob(async (blob: Blob | null) => {
        if (blob) {
          this.cropped.emit(blob);
        }
      }, MediaConstants.image.exportFileExtension);
    }
  }
}
