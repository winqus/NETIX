import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ImageCropService } from '@ntx/app/services/image-crop.service';
import { CropperComponent, AngularCropperjsModule } from 'angular-cropperjs';
import { MediaConfigService } from '@ntx/app/services/mediaConfig.service';

export interface InputProps {
  imageUrl?: string;
}

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [AngularCropperjsModule],
  templateUrl: './image-cropper.component.html',
})
export class ImageCropperComponent implements OnInit {
  @Input() props: InputProps = {};
  @Output() cropped = new EventEmitter<string>();

  @ViewChild('angularCropper')
  public angularCropper: CropperComponent = new CropperComponent();

  cropper: Cropper | undefined;
  cropperOptions: Cropper.Options;
  imageUrl: string | null = null;

  defaultProps: InputProps = {
    imageUrl: '',
  };

  constructor(
    public imageCropService: ImageCropService,
    private mediaConfig: MediaConfigService
  ) {
    this.cropperOptions = this.imageCropService.getCropperConfig();
  }

  ngOnInit() {
    if (this.props.imageUrl) {
      this.imageUrl = this.props.imageUrl;
    }
  }

  cropImg() {
    if (this.angularCropper.cropper) {
      this.angularCropper.cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
        if (blob) {
          const croppedImageUrl = URL.createObjectURL(blob);
          this.cropped.emit(croppedImageUrl);
        }
      }, this.mediaConfig.getImageExportFormat());
    }
  }
}
