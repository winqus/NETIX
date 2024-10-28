import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { ModalService } from '@ntx/app/shared/services/modal.service';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { environment } from '@ntx/environments/environment';

@Component({
  selector: 'app-publish-movie-option',
  standalone: true,
  imports: [],
  template: `<button class="btn btn-sm btn-outline w-full border-none justify-start text-left" type="button" (click)="openPublishedPopup()">{{ getPublishedButtonLabel() }}</button> `,
})
export class PublishMovieComponent {
  @Input({ required: true }) movie: MovieDTO | undefined;
  @Output() movieChange = new EventEmitter<MovieDTO>();

  newPosterImg: File | null = null;

  constructor(
    private modalService: ModalService,
    private movieService: MovieService
  ) {}

  openPublishedPopup = () => {
    this.modalService.openModal('publishPopup', this.getPublishPopupTitle(), this.getPublishPopupText(), [
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
          this.onToggleMoviePublish();
        },
        shouldClose: true,
      },
    ]);
  };
  onToggleMoviePublish() {
    if (this.movie == null) return;

    if (!this.movie?.isPublished) {
      this.movieService.publishMovie(this.movie?.id).subscribe({
        next: (response: MovieDTO | undefined) => {
          if (environment.development) console.log('Publishing successful:', response);
          // this.movie = response;
          this.movieChange.emit(response);
        },
        error: (errorResponse: any) => {
          if (environment.development) console.error('Error publishing movie:', errorResponse);
        },
      });
    } else {
      this.movieService.unpublishMovie(this.movie?.id).subscribe({
        next: (response: MovieDTO | undefined) => {
          if (environment.development) console.log('Unpublishing successful:', response);
          // this.movie = response;
          this.movieChange.emit(response);
        },
        error: (errorResponse: any) => {
          if (environment.development) console.error('Error unpublishing movie:', errorResponse);
        },
      });
    }
  }

  getPublishedButtonLabel(): string {
    if (this.movie?.isPublished) return 'Unpublish';

    return 'Publish';
  }

  getPublishPopupTitle(): string {
    if (this.movie == null) return '';

    if (this.movie.isPublished) return 'Unpublish ' + this.movie?.name + '?';

    return 'Publish ' + this.movie?.name + '?';
  }

  getPublishPopupText(): string {
    if (this.movie == null) return '';

    if (this.movie.isPublished) return 'Are you sure you want to unpublish?';

    return 'Are you sure you want to publish?';
  }
}
