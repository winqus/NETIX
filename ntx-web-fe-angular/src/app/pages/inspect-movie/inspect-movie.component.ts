import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { timer } from 'rxjs/internal/observable/timer';
import { environment } from '@ntx/environments/environment.development';
import { MovieDTO, UpdateMovieDTO } from '@ntx-shared/models/movie.dto';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';
import { PosterSize } from '@ntx-shared/models/posterSize.enum';
import { PosterService } from '@ntx-shared/services/posters/posters.service';
import { FieldRestrictions, TimeDelays } from '@ntx-shared/config/constants';
import { formatDate } from '@ntx/app/shared/services/utils/utils';

@Component({
  selector: 'app-inspect-movie',
  standalone: true,
  imports: [SvgIconsComponent, ReactiveFormsModule],
  templateUrl: './inspect-movie.component.html',
  styleUrl: './inspect-movie.component.scss',
})
export class InspectMovieComponent implements OnInit {
  @ViewChild('editModal') editModal!: ElementRef<HTMLDialogElement>;
  @ViewChild('publishPopup') publishPopup!: ElementRef<HTMLDialogElement>;

  movie: MovieDTO | undefined;
  posterUrl: string | null = null;
  isFromCreation: boolean = false;
  movieTitleEditForm: FormGroup | null = null;
  errorMessage: string = '';

  constructor(
    private movieService: MovieService,
    private posterService: PosterService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id') || '';
    const navigation = window.history.state || {};
    this.isFromCreation = navigation.from === 'creation';

    this.movieService.getMovieMetadata(movieId).subscribe({
      next: (response) => {
        if (environment.development) console.log('Upload successful:', response);
        this.movie = response;

        this.populateEditForm(this.movie.name, this.movie.summary, this.movie.originallyReleasedAt, this.movie.runtimeMinutes);

        console.log(this.movie!.posterID);
        if (this.isFromCreation) {
          timer(TimeDelays.posterProcessingDelay).subscribe(() => this.loadPoster(this.movie!.posterID, PosterSize.L));
        } else {
          this.loadPoster(this.movie!.posterID, PosterSize.L);
        }
        if (environment.development) console.log(this.movie);
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error uploading metadata:', errorResponse);
      },
    });
  }

  loadPoster(id: string, size: string): void {
    this.posterService.getPoster(id, size).subscribe({
      next: (blob: Blob) => {
        this.posterUrl = URL.createObjectURL(blob);
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error loading poster:', errorResponse);
        this.posterUrl = null;
      },
    });
  }

  onSubmitNewMetadata() {
    if (this.movieTitleEditForm == null) return;
    if (this.movie == null) return;

    if (this.movieTitleEditForm.valid) {
      const movieData: UpdateMovieDTO = {
        name: this.movieTitleEditForm.get('title')?.value,
        summary: this.movieTitleEditForm.get('summary')?.value,
        originallyReleasedAt: this.movieTitleEditForm.get('originallyReleasedAt')?.value,
        runtimeMinutes: this.movieTitleEditForm.get('runtimeMinutes')?.value,
      };

      this.movieService.updateMovieMetadata(this.movie?.id, movieData).subscribe({
        next: (response) => {
          if (environment.development) console.log('Update successful:', response);
          this.editModal.nativeElement.close();
          this.movie = response;
        },
        error: (errorResponse) => {
          this.errorMessage = errorResponse.error.message;
          if (environment.development) console.error('Error updating metadata:', errorResponse);
        },
      });
    }
  }

  onToggleMoviePublish() {
    if (this.movie == null) return;

    if (!this.movie?.isPublished) {
      this.movieService.publishMovie(this.movie?.id).subscribe({
        next: (response) => {
          if (environment.development) console.log('Publishing successful:', response);
          this.movie = response;
        },
        error: (errorResponse) => {
          if (environment.development) console.error('Error publishing movie:', errorResponse);
        },
      });
    } else {
      this.movieService.unpublishMovie(this.movie?.id).subscribe({
        next: (response) => {
          if (environment.development) console.log('Unpublishing successful:', response);
          this.movie = response;
        },
        error: (errorResponse) => {
          if (environment.development) console.error('Error unpublishing movie:', errorResponse);
        },
      });
    }

    this.publishPopup.nativeElement.close();
  }

  isPublished(): string {
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

  getErrorMessage(controlName: string): string {
    if (this.movieTitleEditForm == null) return '';

    const control = this.movieTitleEditForm.get(controlName);
    if (control?.touched && control.invalid) {
      if (control.errors?.['required']) {
        return 'This field is required';
      } else if (control.errors?.['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `Minimum length is ${requiredLength}`;
      } else if (control.errors?.['maxlength']) {
        const requiredLength = control.errors['maxlength'].requiredLength;
        return `Maximum length is ${requiredLength}`;
      } else if (control.errors?.['min']) {
        const minValue = control.errors['min'].min;
        return `Minimum value is ${minValue}`;
      } else if (control.errors?.['max']) {
        const maxValue = control.errors['max'].max;
        return `Maximum value is ${maxValue}`;
      } else if (control.errors?.['pattern']) {
        return this.getPatternErrorMessage(controlName);
      }
    }
    return '';
  }

  private getPatternErrorMessage(controlName: string): string {
    switch (controlName) {
      case 'runtimeMinutes':
        return FieldRestrictions.runtimeMinutes.patternError;
      default:
        return 'Invalid format';
    }
  }

  isInvalid(controlName: string): boolean {
    if (this.movieTitleEditForm == null) return false;

    const control = this.movieTitleEditForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  isFormValid(): boolean {
    if (this.movieTitleEditForm == null) return false;

    return this.movieTitleEditForm.valid && this.isEdited();
  }

  isEdited(): boolean {
    if (this.movie == null) return false;

    if (this.movieTitleEditForm == null) return false;

    const formValues = this.movieTitleEditForm.value;

    if (formValues.title !== this.movie.name) return true;

    if (formValues.summary !== this.movie.summary) return true;

    const formDate = formatDate(new Date(formValues.originallyReleasedAt));
    const movieDate = formatDate(new Date(this.movie.originallyReleasedAt));
    if (formDate !== movieDate) return true;

    if (formValues.runtimeMinutes.toString() !== this.movie.runtimeMinutes.toString()) return true;

    return false;
  }

  resetEditedForm() {
    if (this.movie == null) return;

    this.populateEditForm(this.movie.name, this.movie.summary, this.movie.originallyReleasedAt, this.movie.runtimeMinutes);
  }

  populateEditForm(name: string, summary: string, originallyReleasedAt: Date, runtimeMinutes: number) {
    this.movieTitleEditForm = new FormGroup({
      title: new FormControl(name, [Validators.required, Validators.minLength(FieldRestrictions.title.minLength), Validators.maxLength(FieldRestrictions.title.maxLength)]),
      summary: new FormControl(summary, [Validators.required, Validators.minLength(FieldRestrictions.summary.minLength), Validators.maxLength(FieldRestrictions.summary.maxLength)]),
      originallyReleasedAt: new FormControl(formatDate(originallyReleasedAt), [Validators.required]),
      runtimeMinutes: new FormControl(runtimeMinutes, [
        Validators.required,
        Validators.min(FieldRestrictions.runtimeMinutes.min),
        Validators.max(FieldRestrictions.runtimeMinutes.max),
        Validators.pattern(FieldRestrictions.runtimeMinutes.pattern),
      ]),
    });
  }
}
