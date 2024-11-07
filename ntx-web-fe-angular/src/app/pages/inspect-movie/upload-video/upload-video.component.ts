import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SvgIconsComponent } from '@ntx/app/shared/ui/svg-icons.component';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { VideoRequirementDTO } from '@ntx/app/shared/models/video.dto';
import { ModalService } from '@ntx/app/shared/services/modal.service';
import { VideoService } from '@ntx/app/shared/services/videos/video.service';
import { ModalButton } from '@ntx/app/shared/ui/modal.component';
import { environment } from '@ntx/environments/environment';

@Component({
  selector: 'app-upload-video',
  standalone: true,
  imports: [SvgIconsComponent],
  template: `
    @if (movie?.videoID === null) {
      <button class="btn btn-sm btn-outline border-none justify-start text-left disabled" type="button" onclick="document.getElementById('videoUploadInput').click()">Add Video</button>
      <input id="videoUploadInput" type="file" class="hidden" [size]="getVideoMaxSize()" [accept]="getVideoAcceptType()" (change)="onVideoUpload($event)" />
    }
  `,
})
export class UploadVideoComponent implements OnInit {
  @Input({ required: true }) movie: MovieDTO | undefined;
  @Output() videoUpload = new EventEmitter<File>();

  videoRequirements?: VideoRequirementDTO;

  video: File | null = null;
  modalButtons: ModalButton[] = [];

  constructor(
    private readonly videoService: VideoService,
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

    console.log(newFile);
    this.video = newFile;

    if (newFile == undefined) return;

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
          console.log('Uploading video');
        },
        shouldClose: true,
      },
    ];

    this.modalService.openModal('uploadVideoConfirmPopup', 'Upload video', 'Are you sure you want to upload this video: ' + this.video?.name, this.modalButtons);
  };

  getVideoAcceptType(): string {
    if (this.videoRequirements == undefined) return '';
    return this.videoRequirements!.supportedMimeTypes.join(',');
  }
  getVideoMaxSize(): number {
    if (this.videoRequirements == undefined) return 1;
    return this.videoRequirements!.maxFileSizeInBytes;
  }
}
