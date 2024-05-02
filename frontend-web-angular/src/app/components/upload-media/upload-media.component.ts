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
import { Router } from '@angular/router';
import { AlertCardComponent } from '../alert-card/alert-card.component';

enum UploadSteps {
  FileSelection,
  DetailsFilling,
  ThumbNailSelection,
  Uploading,
}

@Component({
  selector: 'app-upload-media',
  standalone: true,
  templateUrl: './upload-media.component.html',
  imports: [SvgIconsComponent, VideoFileSelectionComponent, AlertCardComponent],
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

  errorMessage = '';
  hideError = true;

  constructor(
    private router: Router,
    public uploadMediaService: UploadMediaService,
    private uploadService: UploadService
  ) {
    this.uploadService.getConstraints().subscribe({
      next: (uploadConstraints: UploadConstraintsDTO) => {
        this.uploadConstraints = uploadConstraints;
      },
      error: (error) => {
        this.showError(error);
      },
    });

    this.uploadService.splitChunkProgress.subscribe((progress) => {
      this.splitChunkProgress = progress;
    });

    this.uploadService.sendChunkProgress.subscribe((progress) => {
      this.uploadChunkProgress += progress;
    });
  }

  handleVideoFile(file: File) {
    this.video = file;
  }

  handleThumbnailFile(file: File) {
    this.mediaThumbnail = file;
  }

  handleCardHide(isHiden: boolean) {
    this.hideError = isHiden;
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
    this.uploadData();
    this.currentStep = UploadSteps.Uploading;
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  onChangeTitle(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.mediaTitle = newValue;
  }

  onChangeDate(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.mediaDate = new Date(newValue);
    console.log(newValue, this.mediaDate);
  }

  mediaDateToSimpleDateFormat(): string {
    if (this.mediaDate == null) return '';

    const date = new Date(this.mediaDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`; // Format date into 'yyyy-MM-dd'
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

  uploadData() {
    this.uploadService.getPermision(this.video!).subscribe({
      next: async (permission: PermissionResponseDTO) => {
        const chunks = await this.uploadService.splitVideoIntoChunks(this.video!, permission);
        this.chunkSize = chunks.length;

        this.uploadService.uploadChunks(chunks, permission);

        const metadataRequest: UploadMetadataRequestDTO = { metadata: { title: this.mediaTitle, publishDatetime: this.mediaDate } };

        this.uploadService.uploadMetadata(permission.uploadId, metadataRequest).subscribe({
          next: (metadataResponse) => {
            if (metadataResponse.success) {
              this.uploadMetaData = 100;
            }
          },
          error: (error) => {
            this.showError(error);
          },
        });

        (await this.uploadService.uploadThumbnail(permission.uploadId, this.mediaThumbnail!)).subscribe({
          next: () => {
            this.uploadThumbnail = 100;
          },
          error: (error) => {
            this.showError(error);
          },
        });
      },
      error: (error) => {
        this.showError(error);
      },
    });
  }

  totalProgress(): number {
    let chunkSize = this.chunkSize;

    if (chunkSize == 0) {
      chunkSize = 1;
    }
    const uploadVideoProcess = (this.uploadChunkProgress / chunkSize) * 100;

    return this.splitChunkProgress + uploadVideoProcess + this.uploadMetaData + this.uploadThumbnail;
  }

  isUploaded(): boolean {
    return this.totalProgress() == 400 ? true : false;
  }

  showError(error: any) {
    if (error.error.error == undefined) {
      this.errorMessage = `${error.status} ${error.error.message}`;
    } else {
      this.errorMessage = `${error.error.error}`;
    }
    this.hideError = false;
  }
}
