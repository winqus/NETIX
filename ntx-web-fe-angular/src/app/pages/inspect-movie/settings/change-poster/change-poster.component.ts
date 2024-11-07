import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MediaConstants } from '@ntx-shared/config/constants';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { ContentComponent, ModalService } from '@ntx-shared/services/modal.service';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { ImageUploadComponent } from '@ntx-shared/ui/image-upload/image-upload.component';
import { ModalButton } from '@ntx-shared/ui/modal.component';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';
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
  modalButtons: ModalButton[] = [];

  constructor(
    private readonly modalService: ModalService,
    private readonly movieService: MovieService,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  onPosterChange(event: any) {
    const newFile = event.target.files[0] as File;

    if (newFile == undefined) return;

    this.newPosterImg = newFile;

    this.openPosterUpdatedPopup();
  }

  openPosterUpdatedPopup = () => {
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
          this.changePoster();
        },
        shouldClose: true,
      },
    ];

    const contentComponent: ContentComponent<ImageUploadComponent> = {
      component: ImageUploadComponent,
      inputProps: { props: { accept: this.getNewPosterImageAcceptType(), readonly: false, originalImage: this.newPosterImg, clearImgButton: false } },
    };

    const { contentRef } = this.modalService.openModal<ImageUploadComponent>('posterUpdateConfirmPopup', 'Update poster', '', this.modalButtons, contentComponent);

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
        this.errorHandler.showSuccess('Movie poster updated');

        this.movieChange.emit(response);
      },
      error: (errorResponse: { error: { message: string } }) => {
        if (environment.development) console.error('Error updating poster:', errorResponse);
        this.errorHandler.showError('An error occurred while updating poster. Please try again later.', 'Poster updating unsuccessful');
      },
    });
  }

  getNewPosterImageAcceptType(): string {
    return MediaConstants.image.formats.join(',');
  }
}
