import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { VideoRequirementDTO } from '@ntx-shared/models/video.dto';
import { ModalService } from '@ntx-shared/services/modal.service';
import { VideoService } from '@ntx-shared/services/videos/video.service';
import { ModalButton } from '@ntx-shared/ui/modal.component';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';
import { environment } from '@ntx/environments/environment';
import { formatFileSize } from '@ntx-shared/services/utils/utils';

export interface UploadVideoProps {
  id?: string;
  label?: string;
  class?: string;
}

@Component({
  selector: 'app-upload-video',
  standalone: true,
  imports: [],
  template: `
    <button [class]="props.class" type="button" (click)="triggerFileInput()">{{ props.label }}</button>
    <input #fileInputRef [id]="props.id" type="file" class="hidden" [accept]="getVideoAcceptType()" (change)="onVideoUpload($event)" />
  `,
})
export class UploadVideoComponent implements OnInit {
  @Input({ required: true }) props: UploadVideoProps = {};
  @Output() videoUpload = new EventEmitter<File>();

  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;
  videoRequirements?: VideoRequirementDTO;

  video: File | null = null;
  modalButtons: ModalButton[] = [];

  constructor(
    private readonly videoService: VideoService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.videoService.getVideoRequirements().subscribe({
      next: (response) => {
        if (environment.development) console.log('Video requirements recieved successful:', response);
        this.videoRequirements = response;
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error getting video requirements:', errorResponse);
      },
    });
  }

  onVideoUpload(event: any) {
    const newFile = event.target.files[0] as File;
    if (newFile == undefined) return;

    if (environment.development) console.log(newFile);

    if (newFile.size > this.getVideoMaxSize()) {
      this.errorHandler.showError(`The file exceeds the maximum allowed size of ${formatFileSize(this.videoRequirements!.maxFileSizeInBytes)}.`, 'Upload unsuccessful');
      this.video = null;
      this.resetFileInput();
      return;
    }

    this.video = newFile;
    this.openVideoUploaddPopup();
  }

  openVideoUploaddPopup = () => {
    this.modalButtons = [
      {
        text: 'Cancel',
        class: 'btn btn-square btn-outline w-fit px-4',
        action: () => {},
        shouldClose: true,
      },
      {
        text: 'Confirm',
        class: 'btn btn-square btn-primary btn-outline w-fit px-4',
        action: () => {
          this.videoUpload.emit(this.video!);
          this.video = null;
        },
        shouldClose: true,
      },
    ];

    this.modalService.openModal('uploadVideoConfirmPopup', 'Upload video', 'Are you sure you want to upload this video: ' + this.video?.name, this.modalButtons);
  };

  getVideoAcceptType(): string {
    if (this.videoRequirements == undefined) return '';
    return this.videoRequirements.supportedMimeTypes.join(',');
  }

  getVideoMaxSize(): number {
    if (this.videoRequirements == undefined) return 1;
    return this.videoRequirements.maxFileSizeInBytes;
  }

  triggerFileInput() {
    const fileInput = document.getElementById(this.props.id!) as HTMLInputElement;
    fileInput.click();
  }

  resetFileInput() {
    this.fileInputRef.nativeElement.value = '';
  }
}
