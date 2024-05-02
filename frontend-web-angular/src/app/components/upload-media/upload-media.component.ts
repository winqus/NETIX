// TODO there is no indicator for when users files are uploading from their pc, can be a problem when huge files are being uploaded
// TODO limit acces when steps are not completed
// TODO error handeling

import { Component } from '@angular/core';
import { UploadMediaService } from '../../services/upload-media.service';
import { SvgIconsComponent } from '../svg-icons/svg-icons.component';
import { VideoFileSelectionComponent } from './components/file-selection/file-selection.component';
import { UploadConstraintsDTO } from '../../models/uploadConstraints.dto';
import { UploadService } from '../../services/upload.service';
import { PermissionResponseDTO } from '../../models/uploadPermission.dto';
import { UploadMetadataRequestDTO } from '../../models/uploadMetadata.dto';

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
  UploadSteps = UploadSteps;
  currentStep: UploadSteps = UploadSteps.FileSelection;

  video: File | null = null;
  mediaThumbnail: File | null = null;

  mediaTitle: string = '';
  mediaDate!: Date;
  mediaUpdatedAt!: Date;

  uploadConstraints: UploadConstraintsDTO | null = null;

  // progress
  chunkSize = 0;
  splitChunkProgress = 0;
  uploadChunkProgress = 0;
  uploadMetaData = 0;
  uploadThumbnail = 0;

  constructor(
    public uploadMediaService: UploadMediaService,
    private uploadService: UploadService
  ) {
    this.uploadService.getConstraints().subscribe({
      next: (uploadConstraints: UploadConstraintsDTO) => {
        this.uploadConstraints = uploadConstraints;
      },
      error: (error) => {
        // TODO if error ocours disable upload functionality (better error handeling)
        alert(`There has been an server error \n ${JSON.stringify(error.message)}`);
        console.log(error);
      },
    });

    this.uploadService.splitChunkProgress.subscribe((progress) => {
      this.splitChunkProgress = progress;
    });

    this.uploadService.sendChunkProgress.subscribe((progress) => {
      console.log(progress);

      this.uploadChunkProgress += progress;
    });
  }

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
    this.uploadData();
  }

  onChangeTitle(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.mediaTitle = newValue;
  }

  onChangeDate(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.mediaDate = new Date(newValue);
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
  // TODO rename method
  uploadData() {
    this.uploadService.getPermision(this.video!).subscribe({
      next: async (permission: PermissionResponseDTO) => {
        console.log(permission);

        const chunks = await this.uploadService.splitVideoIntoChunks(this.video!, permission);
        this.chunkSize = chunks.length;

        this.uploadService.uploadChunks(chunks, permission);

        const metadataRequest: UploadMetadataRequestDTO = { metadata: { title: this.mediaTitle, publishDatetime: this.mediaDate } };

        this.uploadService.uploadMetadata(permission.uploadId, metadataRequest).subscribe({
          next: (metadataResponse) => {
            console.log(metadataResponse);
            if (metadataResponse.success) {
              // TODO add to progress, prob
              this.uploadMetaData = 100;
            }
          },
          error: (error) => {
            // TODO if error ocours disable upload functionality (better error handeling)
            // alert(`There has been an server error \n ${JSON.stringify(error.message)}`);
            console.log(error);
          },
        });

        (await this.uploadService.uploadThumbnail(permission.uploadId, this.mediaThumbnail!)).subscribe({
          next: (response) => {
            console.log(response);
            this.uploadThumbnail = 100;
          },
          error: (error) => {
            // TODO if error ocours disable upload functionality (better error handeling)
            // alert(`There has been an server error \n ${JSON.stringify(error.message)}`);
            console.log(error);
          },
        });
      },
      error: (error) => {
        // TODO if error ocours disable upload functionality (better error handeling)
        // alert(`There has been an server error \n ${JSON.stringify(error.message)}`);
        console.log(error);
      },
    });
  }
  totalProgress(): number {
    const uploadVideoProcess = (this.uploadChunkProgress / this.chunkSize) * 100;

    return this.splitChunkProgress + uploadVideoProcess + this.uploadMetaData + this.uploadThumbnail;
  }
}
