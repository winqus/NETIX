import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MediaConstants } from '@ntx/app/shared/config/constants';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { ErrorHandlerService } from '@ntx/app/shared/services/errorHandler.service';
import { ModalService, ContentComponent } from '@ntx/app/shared/services/modal.service';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { ImageUploadComponent } from '@ntx/app/shared/ui/image-upload/image-upload.component';
import { ModalButton } from '@ntx-shared/ui/modal.component';
import { environment } from '@ntx/environments/environment';

@Component({
  selector: 'app-change-backdrop-option',
  standalone: true,
  imports: [],
  template: `<li>
    <button class="btn btn-sm btn-outline border-none justify-start text-left" type="button" onclick="document.getElementById('backdropInput').click()">Change backdrop</button>
    <input id="backdropInput" type="file" class="hidden" [accept]="getNewBackdropImageAcceptType()" (change)="onBackdropChange($event)" />
  </li>`,
})
export class ChangeBackdropComponent {
  @Input({ required: true }) movie: MovieDTO | undefined;
  @Output() movieChange = new EventEmitter<MovieDTO>();

  newBackdropImg: File | null = null;
  modalButtons: ModalButton[] = [];

  constructor(
    private readonly modalService: ModalService,
    private readonly movieService: MovieService,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  onBackdropChange(event: any) {
    const newFile = event.target.files[0] as File;

    if (newFile == undefined) return;

    this.newBackdropImg = newFile;

    this.openBackdropUpdatedPopup();
  }

  openBackdropUpdatedPopup = () => {
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
          this.changebackdrop();
        },
        shouldClose: true,
      },
    ];

    const contentComponent: ContentComponent<ImageUploadComponent> = {
      component: ImageUploadComponent,
      inputProps: { props: { accept: this.getNewBackdropImageAcceptType(), readonly: false, originalImage: this.newBackdropImg, aspectRatio: 3 / 2, clearImgButton: false } },
    };

    const { contentRef } = this.modalService.openModal<ImageUploadComponent>('backdropUpdateConfirmPopup', 'Update backdrop', '', this.modalButtons, contentComponent);

    if (contentRef) {
      contentRef.instance.filePassed.subscribe((croppedImage: File | null) => {
        if (croppedImage) {
          this.newBackdropImg = croppedImage;
        }
      });
    }
  };

  changebackdrop() {
    if (this.movie == null) return;

    const formData = new FormData();
    formData.append('backdrop', this.newBackdropImg as Blob);

    this.movieService.updateBackdrop(this.movie?.id, formData).subscribe({
      next: (response) => {
        if (environment.development) console.log('Update backdrop successful:', response);
        this.errorHandler.showSuccess('Movie backdrop updated');

        this.movieChange.emit(response);
      },
      error: (errorResponse: { error: { message: string } }) => {
        if (environment.development) console.error('Error updating backdrop:', errorResponse);
        this.errorHandler.showError('An error occurred while updating backdrop. Please try again later.', 'Backdrop updating unsuccessful');
      },
    });
  }

  getNewBackdropImageAcceptType(): string {
    return MediaConstants.image.formats.join(',');
  }
}
