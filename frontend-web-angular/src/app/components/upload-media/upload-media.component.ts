// TODO there is no indicator for when users files are uploading from their pc, can be a problem when huge files are being uploaded
// TODO limit acces when steps are not completed
// TODO error handeling

import { Component } from '@angular/core';
import { UploadMediaService } from '../../services/upload-media.service';

enum UploadSteps {
  FileSelection,
  DetailsFilling,
  ThumbNailSelection,
  Uploading,
}

@Component({
  selector: 'app-upload-media',
  standalone: true,
  imports: [],
  templateUrl: './upload-media.component.html',
})
export class UploadMediaComponent {
  constructor(public uploadMediaService: UploadMediaService) {}

  UploadSteps = UploadSteps;
  currentStep: UploadSteps = UploadSteps.FileSelection;
  isDraggingOver: boolean = false;
  allowedMediaFormats: string[] = ['video/mp4', 'video/mov', 'video/x-matroska', 'video/hevc'];
  allowedThumbnailFormats: string[] = ['image/PNG', 'image/jpg', 'image/JPEG'];

  mediaFile: File | null = null;
  mediaThumbnail: File | null = null;
  mediaTitle: string = '';
  mediaDescription: string = '';
  mediaDate!: Date;
  mediaUpdatedAt!: Date;

  mediaUploadProgress: number = 0;

  //file upload
  onFileSelected(event: Event, _isMedia: boolean = false, _isThumbnail: boolean = false) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    if (_isMedia) this.setMediaFile(file);
    if (_isThumbnail) this.setThumbFile(file);
  }

  dragOverHandler(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = true;
  }

  dropHandler(event: DragEvent, _isMedia: boolean = false, _isThumbnail: boolean = false) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];

      if (_isMedia) this.setMediaFile(file);
      if (_isThumbnail) this.setThumbFile(file);
    }
  }

  dragLeaveHandler(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = false;
  }

  setMediaFile(file: File) {
    if (this.isValidMediaFormat(file)) {
      console.log(file);
      this.mediaFile = file;
    } else {
      alert('Invalid file format. Please upload a valid video file.');
    }
  }

  isValidMediaFormat(file: File): boolean {
    return this.allowedMediaFormats.includes(file.type);
  }
  setThumbFile(file: File) {
    if (this.isValidThumbnailFormat(file)) {
      this.mediaThumbnail = file;
    } else {
      alert('Invalid file format. Please upload a valid image file.');
    }
  }
  isValidThumbnailFormat(file: File): boolean {
    return this.allowedThumbnailFormats.includes(file.type);
  }

  // ----

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
    this.uploadMedia();
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
  mediaFormats(formats: string[]): string {
    return formats.join(',');
  }

  async uploadMedia() {
    this.uploadMediaService.uploadFile(this.mediaFile!);
    const progressChunk = 100 / this.uploadMediaService.totalChunks!;
    for (let chunk = 0; chunk < this.uploadMediaService.totalChunks!; chunk++) {
      this.mediaUploadProgress += progressChunk;
      this.uploadMediaService.uploadFileChunk(this.mediaFile!, '', chunk).subscribe();
    }
  }
}
