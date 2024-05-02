// TODO there is no indicator for when users files are uploading from their pc, can be a problem when huge files are being uploaded
// TODO limit acces when steps are not completed
// TODO error handeling

import { Component } from '@angular/core';
import { UploadMediaService } from '../../services/upload-media.service';
import { SvgIconsComponent } from '../svg-icons/svg-icons.component';
import { VideoFileSelectionComponent } from './components/file-selection/file-selection.component';
import { UploadConstraintsDTO } from '../../models/uploadConstraints.dto';

enum UploadSteps {
  FileSelection,
  DetailsFilling,
  ThumbNailSelection,
  Uploading,
}

@Component({
  selector: 'app-upload-media',
  standalone: true,
  imports: [SvgIconsComponent, VideoFileSelectionComponent],
  templateUrl: './upload-media.component.html',
})
export class UploadMediaComponent {
  constructor(public uploadMediaService: UploadMediaService) {}

  UploadSteps = UploadSteps;
  currentStep: UploadSteps = UploadSteps.FileSelection;

  video: File | null = null;
  mediaThumbnail: File | null = null;

  mediaTitle: string = '';
  mediaDescription: string = '';
  mediaDate!: Date;
  mediaUpdatedAt!: Date;

  mediaUploadProgress: number = 0;

  uploadConstraints: UploadConstraintsDTO = {
    videoFileConstraints: {
      durationInSeconds: {
        min: 30, // Minimum duration of 30 seconds
        max: 3600, // Maximum duration of 1 hour
      },
      sizeInBytes: {
        min: 1048576, // Minimum size of 1MB
        max: 1073741824, // Maximum size of 1GB
      },
      allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
      resolution: {
        minWidth: 640, // Minimum width of 640 pixels
        minHeight: 360, // Minimum height of 360 pixels
        maxWidth: 1920, // Maximum width of 1920 pixels
        maxHeight: 1080, // Maximum height of 1080 pixels
      },
    },
    thumbnailConstraints: {
      maxSizeBytes: 204800, // Maximum file size of 200KB
      allowedMimeTypes: ['image/jpeg', 'image/png'],
      resolution: {
        minWidth: 640, // Minimum width of 640 pixels
        minHeight: 360, // Minimum height of 360 pixels
        maxWidth: 1280, // Maximum width of 1280 pixels
        maxHeight: 720, // Maximum height of 720 pixels
      },
      aspectRatio: {
        width: 16, // Aspect ratio width component
        height: 9, // Aspect ratio height component
      },
    },
  };

  handleVideoFile(file: File) {
    console.log('Received file:', file);
    this.video = file;
  }

  handleThumbnailFile(file: File) {
    console.log('Received file:', file);
    this.mediaThumbnail = file;
  }

  goToFileSelection() {
    this.currentStep = UploadSteps.FileSelection;
  }

  goToDetailsFilling() {
    this.currentStep = UploadSteps.DetailsFilling;
  }

  goToThumnNailSelection() {
    this.currentStep = UploadSteps.ThumbNailSelection;
  }

  goToUploading() {
    this.currentStep = UploadSteps.Uploading;
    // this.uploadMedia();
  }

  onChangeTitle(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.mediaTitle = newValue;
  }

  onChangeDate(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.mediaDate = new Date(newValue);
  }

  onChangeDescription(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.mediaDescription = newValue;
  }

  mediaDateToSimpleDateFormat(): string {
    if (this.mediaDate == null) return '';
    const year: string = this.mediaDate.getFullYear().toString();
    const month: string = this.mediaDate.getMonth().toString().padStart(2, '0');
    const day: string = this.mediaDate.getDay().toString().padStart(2, '0');

    return year + '-' + month + '-' + day;
  }

  calculateProgress(): any {
    switch (this.currentStep) {
      case UploadSteps.FileSelection:
        return '0';
      case UploadSteps.DetailsFilling:
        return '33.333';
      case UploadSteps.ThumbNailSelection:
        return '66.666';
      case UploadSteps.Uploading:
        return '100';
      default:
        return '0';
    }
  }
}
