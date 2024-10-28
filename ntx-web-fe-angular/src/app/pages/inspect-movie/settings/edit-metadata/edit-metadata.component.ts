import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MovieDTO, UpdateMovieDTO } from '@ntx/app/shared/models/movie.dto';
import { ModalService } from '@ntx/app/shared/services/modal.service';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { ModalButton } from '@ntx/app/shared/ui/modal.component';
import { MovieFormComponent } from '@ntx/app/shared/ui/movie-form/movie-form.component';
import { environment } from '@ntx/environments/environment.development';

@Component({
  selector: 'app-edit-metadata-option',
  standalone: true,
  imports: [],
  template: `<button class="btn btn-sm btn-outline w-full border-none justify-start text-left" type="button" (click)="openPosterUpdatedModal()">Edit metadata</button> `,
})
export class EditMetadataComponent {
  @Input({ required: true }) movie: MovieDTO | undefined;
  @Output() movieChange = new EventEmitter<MovieDTO>();

  movieForm: FormGroup | null = null;
  modalButtons: ModalButton[] = [];
  errorMessage: string = '';

  constructor(
    private modalService: ModalService,
    private movieService: MovieService
  ) {}

  openPosterUpdatedModal = () => {
    this.modalButtons = [
      {
        text: 'Reset',
        class: 'btn btn-square btn-outline w-fit px-4',
        action: () => {
          contentRef?.instance.resetEditedForm();
        },
        shouldClose: false,
        disabled: true,
      },
      {
        text: 'SAVE',
        class: 'btn btn-square btn-primary btn-outline w-fit px-4',
        action: () => {
          this.onSubmitNewMetadata();
        },
        shouldClose: true,
        disabled: true,
      },
    ];

    const { contentRef } = this.modalService.openModal<MovieFormComponent>('editModal', 'Edit', '', this.modalButtons, MovieFormComponent, { movie: this.movie, errorMessage: this.errorMessage });

    if (contentRef) {
      contentRef.instance.formGroupChange.subscribe((formGroup: FormGroup) => {
        this.movieForm = formGroup;

        const saveButton = this.modalButtons.find((button) => button.text === 'SAVE');
        const resetButton = this.modalButtons.find((button) => button.text === 'Reset');

        if (saveButton) {
          saveButton.disabled = !contentRef.instance.isFormValid();
        }

        if (resetButton) {
          resetButton.disabled = !contentRef.instance.isFormValid();
        }
      });
    }
  };

  onSubmitNewMetadata() {
    if (this.movieForm == null) return;
    if (this.movie == null) return;

    if (this.movieForm.valid) {
      const movieData: UpdateMovieDTO = {
        name: this.movieForm.get('title')?.value,
        summary: this.movieForm.get('summary')?.value,
        originallyReleasedAt: this.movieForm.get('originallyReleasedAt')?.value,
        runtimeMinutes: this.movieForm.get('runtimeMinutes')?.value,
      };

      this.movieService.updateMovieMetadata(this.movie?.id, movieData).subscribe({
        next: (response: MovieDTO | undefined) => {
          if (environment.development) console.log('Update successful:', response);
          this.movieChange.emit(response);
        },
        error: (errorResponse: { error: { message: string } }) => {
          this.errorMessage = errorResponse.error.message;
          if (environment.development) console.error('Error updating metadata:', errorResponse);
        },
      });
    }
  }
}
