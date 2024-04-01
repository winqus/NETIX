import { Component } from '@angular/core';

enum UploadSteps {
  FileSelection,
  DetailsFilling,
  ThumbNailSelection,
}

@Component({
  selector: 'app-upload-media',
  standalone: true,
  imports: [],
  templateUrl: './upload-media.component.html',
})
export class UploadMediaComponent {
  UploadSteps = UploadSteps;
  currentStep: UploadSteps = UploadSteps.FileSelection;
  isDraggingOver: boolean = false;
  allowedFormats: string[] = ['video/mp4', 'video/mov', 'video/mkv', 'video/hevc'];

  videoFile: File | null = null;
  // mediaItem?: MediaItem;
  mediaTitle: string = '';
  mediaDate!: Date;
  mediaUpdatedAt!: Date;

  //file upload
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    this.setFile(file);
  }

  dragOverHandler(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = true;
  }

  dropHandler(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];
      this.setFile(file);
    }
  }

  dragLeaveHandler(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = false;
  }

  setFile(file: File) {
    if (this.isValidFormat(file)) {
      this.videoFile = file;
    } else {
      alert('Invalid file format. Please upload a valid video file.');
    }
  }

  isValidFormat(file: File): boolean {
    return this.allowedFormats.includes(file.type);
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

  onChangeTitle(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.mediaTitle = newValue;
  }

  onChangeDate(event: Event) {
    const newValue = (event.target as HTMLInputElement).value;
    this.mediaDate = new Date(newValue);
    console.log(this.mediaDate);
  }

  calculateProgress(): any {
    switch (this.currentStep) {
      case UploadSteps.FileSelection:
        return '0';
      case UploadSteps.DetailsFilling:
        return '50';
      case UploadSteps.ThumbNailSelection:
        return '60';
      default:
        return '0';
    }
  }
}
