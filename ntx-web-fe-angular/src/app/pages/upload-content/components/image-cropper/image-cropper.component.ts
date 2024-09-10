import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { CropperComponent, AngularCropperjsModule } from 'angular-cropperjs';
import { ImageService } from '@ntx-shared/services/image.service';
import { MediaConfigService } from '@ntx-shared/services/mediaConfig.service';

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

  constructor(
    public imageCropService: ImageService,
    private mediaConfig: MediaConfigService
  ) {
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
    if (this.angularCropper.cropper) {
      this.angularCropper.cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
        if (blob) {
          this.cropped.emit(blob);
        }
      }, this.mediaConfig.getImageExportFormat());
    }
  }
}
