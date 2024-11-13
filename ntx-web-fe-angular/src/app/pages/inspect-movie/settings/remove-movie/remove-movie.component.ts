import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';
import { ModalService } from '@ntx-shared/services/modal.service';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { ModalButton } from '@ntx-shared/ui/modal.component';
import { environment } from '@ntx/environments/environment';

@Component({
  selector: 'app-remove-movie-option',
  standalone: true,
  imports: [],
  template: `<button class="btn btn-sm btn-outline w-full border-none justify-start text-left" type="button" (click)="openRemovePopup()">Remove</button> `,
})
export class RemoveMovieComponent {
  @Input({ required: true }) movie: MovieDTO | undefined;

  modalButtons: ModalButton[] = [];

  constructor(
    private readonly modalService: ModalService,
    private readonly movieService: MovieService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly router: Router
  ) {}

  openRemovePopup = () => {
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
          this.onRemoveMovie();
        },
        shouldClose: true,
      },
    ];

    this.modalService.openModal('removePopup', 'Remove ' + this.movie?.name, 'Are you sure you want to remove this movie?', this.modalButtons);
  };

  onRemoveMovie() {
    if (this.movie == null) return;

    this.movieService.deleteMovie(this.movie?.id).subscribe({
      next: () => {
        if (environment.development) console.log('Publishing successful');
        this.errorHandler.showSuccess('Movie removed');
        this.router.navigate(['/']);
      },
      error: (errorResponse: any) => {
        if (environment.development) console.error('Error publishing movie:', errorResponse);
        this.errorHandler.showError('An error occurred while removing a movie. Please try again later.', 'Removing unsuccessful');
      },
    });
  }
}
