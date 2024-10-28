import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MediaConstants } from '@ntx/app/shared/config/constants';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { ModalService } from '@ntx/app/shared/services/modal.service';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { ImageUploadComponent } from '@ntx/app/shared/ui/image-upload/image-upload.component';
import { environment } from '@ntx/environments/environment.development';

@Component({
  selector: 'app-change-poster-option',
  standalone: true,
  imports: [],
  template: `<li>
    <button class="btn btn-sm btn-outline border-none justify-start text-left" type="button" onclick="document.getElementById('posterInput').click()">Change poster</button>
    <input id="posterInput" type="file" class="hidden" [accept]="getNewPosterImageAcceptType()" (change)="onPosterChange($event)" />
  </li>`,
})
export class ChangePosterComponent {
  @Input({ required: true }) movie: MovieDTO | undefined;
  @Output() movieChange = new EventEmitter<MovieDTO>();
  newPosterImg: File | null = null;

  constructor(
    private readonly modalService: ModalService,
    private readonly movieService: MovieService
  ) {}

  onPosterChange(event: any) {
    const newFile = event.target.files[0] as File;

    if (newFile == undefined) return;

    this.newPosterImg = newFile;

    this.openPosterUpdatedPopup();
  }

  openPosterUpdatedPopup = () => {
    const { contentRef } = this.modalService.openModal<ImageUploadComponent>(
      'posterUpdateConfirmPopup',
      'Update poster',
      '',
      [
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
            this.changePoster();
          },
          shouldClose: true,
        },
      ],
      ImageUploadComponent,
      { props: { accept: this.getNewPosterImageAcceptType(), readonly: false, originalImage: this.newPosterImg, clearImgButton: false } }
    );

    if (contentRef) {
      contentRef.instance.filePassed.subscribe((croppedImage: File | null) => {
        if (croppedImage) {
          this.newPosterImg = croppedImage;
        }
      });
    }
  };

  changePoster() {
    if (this.movie == null) return;

    const formData = new FormData();
    formData.append('poster', this.newPosterImg as Blob);

    this.movieService.updatePoster(this.movie?.id, formData).subscribe({
      next: (response) => {
        if (environment.development) console.log('Update poster successful:', response);
        this.movieChange.emit(response);
      },
      error: (errorResponse: { error: { message: string } }) => {
        if (environment.development) console.error('Error updating poster:', errorResponse);
      },
    });
  }

  getNewPosterImageAcceptType(): string {
    return MediaConstants.image.formats.join(',');
  }
}
