import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadComponent } from '@ntx-shared/ui/image-upload/image-upload.component';
import { FieldRestrictions, MediaConstants } from '@ntx-shared/config/constants';
import { ExternalMovieService } from '@ntx-shared/services/externalMovie/externalMovie.service';
import { environment } from '@ntx/environments/environment';
import { SearchBarComponent } from '@ntx-pages/create-title/import-title/search-bar/search-bar.component';
import { ExternalTitleSearchResultItem } from '@ntx-shared/models/librarySearch.dto';
import { ExternalMovieDTO } from '@ntx-shared/models/externalMovie.dto';
import { PosterService } from '@ntx-shared/services/posters/posters.service';
import { formatDate } from '@ntx-shared/services/utils/utils';
import { UpdateMovieDTO } from '@ntx/app/shared/models/movie.dto';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';

@Component({
  selector: 'app-import-title',
  standalone: true,
  imports: [ImageUploadComponent, ReactiveFormsModule, SearchBarComponent],
  templateUrl: './import-title.component.html',
})
export class ImportTitleComponent implements OnInit {
  selectedMovie: ExternalMovieDTO | null = null;
  imageFile: File | null = null;
  imageAccept: string = '';
  errorMessage: string = '';
  selectedResultPosterURL: string | null = null;

  externalTitleCreationForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(FieldRestrictions.title.minLength), Validators.maxLength(FieldRestrictions.title.maxLength)]),
    summary: new FormControl('', [Validators.required, Validators.minLength(FieldRestrictions.summary.minLength), Validators.maxLength(FieldRestrictions.summary.maxLength)]),
    originallyReleasedAt: new FormControl('', [Validators.required]),
    runtimeMinutes: new FormControl('', [
      Validators.required,
      Validators.min(FieldRestrictions.runtimeMinutes.min),
      Validators.max(FieldRestrictions.runtimeMinutes.max),
      Validators.pattern(FieldRestrictions.runtimeMinutes.pattern),
    ]),
  });

  constructor(
    private movieService: MovieService,
    private externalMovie: ExternalMovieService,
    private posterService: PosterService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<any> {
    this.imageAccept = MediaConstants.image.formats.join(',');
  }

  isFormValid(): boolean {
    return this.externalTitleCreationForm.valid && (this.imageFile !== null || this.selectedResultPosterURL !== null);
  }

  onSubmit() {
    if (!this.externalTitleCreationForm.valid) return;

    if (this.selectedMovie == null) return;

    let movieId = '';

    this.externalMovie
      .uploadExternalMovieMetadata({
        externalID: this.selectedMovie?.externalID,
        externalProviderID: this.selectedMovie?.providerID,
      })
      .subscribe({
        next: (response) => {
          if (environment.development) console.log('External movie upload successful:', response);
          movieId = response.id;

          if (this.selectedResultPosterURL) {
            console.log(this.selectedResultPosterURL);
            this.posterService.downloadImage(this.selectedResultPosterURL).subscribe({
              next: (blob: Blob) => {
                if (environment.development) console.log('External movie poster download successful:', response);

                this.imageFile = new File([blob], 'th.' + MediaConstants.image.exportFileExtension, {
                  type: MediaConstants.image.exportMimeType,
                  lastModified: Date.now(),
                });
              },
              error: (errorResponse) => {
                if (environment.development) console.error('Error downloading imported poster:', errorResponse);
              },
            });
          }

          const posterFormData = new FormData();
          posterFormData.append('poster', this.imageFile as Blob);

          this.externalMovie.replaceExternalMoviePoster(movieId, posterFormData).subscribe({
            next: (response) => {
              if (environment.development) console.log('External movie poster upload successful:', response);
            },
            error: (errorResponse) => {
              this.errorMessage = errorResponse.error.message;
              if (environment.development) console.error('Error uploading external movie poster:', errorResponse);
            },
          });

          if (this.isEdited() && this.externalTitleCreationForm.valid) {
            console.log(this.externalTitleCreationForm);
            const movieData: UpdateMovieDTO = {
              name: this.externalTitleCreationForm.get('title')?.value ?? '',
              summary: this.externalTitleCreationForm.get('summary')?.value ?? '',
              originallyReleasedAt: new Date(this.externalTitleCreationForm.get('originallyReleasedAt')?.value ?? ''),
              runtimeMinutes: parseInt(this.externalTitleCreationForm.get('runtimeMinutes')?.value ?? ''),
            };

            console.log(movieData);

            this.movieService.updateMovieMetadata(movieId, movieData).subscribe({
              next: (response) => {
                if (environment.development) console.log('Update successful:', response);
              },
              error: (errorResponse) => {
                this.errorMessage = errorResponse.error.message;
                if (environment.development) console.error('Error updating metadata:', errorResponse);
              },
            });
          }

          this.router.navigate(['/inspect/movies', movieId], { state: { from: 'creation' } });
        },
        error: (errorResponse) => {
          this.errorMessage = errorResponse.error.message;
          if (environment.development) console.error('Error uploading external movie:', errorResponse);
        },
      });
  }

  async receiveImageFile(file: File | null) {
    this.imageFile = file;
  }

  getErrorMessage(controlName: string): string {
    const control = this.externalTitleCreationForm.get(controlName);
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
        return FieldRestrictions.runtimeMinutes.patternRrror;
      default:
        return 'Invalid format';
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.externalTitleCreationForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  onMovieSelected(movie: ExternalTitleSearchResultItem) {
    if (movie == null) return;

    this.externalMovie.getExternalMovieMetadata(movie.externalID, movie.providerID).subscribe({
      next: (response) => {
        if (environment.development) console.log('External movie load successful:', response);
        this.selectedMovie = response;

        this.updateFields(this.selectedMovie);
        this.isFormValid();

        this.errorMessage = '';
        if (movie.posterURL != null) this.selectedResultPosterURL = movie.posterURL;
      },
      error: (errorResponse) => {
        this.errorMessage = errorResponse.error.message;
        if (environment.development) console.error('Error loading external movie metadata:', errorResponse);
      },
    });
  }

  updateFields(movie: ExternalMovieDTO) {
    this.externalTitleCreationForm.patchValue({ title: movie.metadata.name });
    this.externalTitleCreationForm.patchValue({ summary: movie.metadata.summary });
    this.externalTitleCreationForm.patchValue({ originallyReleasedAt: movie.metadata.releaseDate });
    this.externalTitleCreationForm.patchValue({ runtimeMinutes: movie.metadata.runtime.toString() });
  }

  isEdited(): boolean {
    if (this.selectedMovie == null) return false;
    if (this.selectedMovie.metadata == null) return false;

    if (this.externalTitleCreationForm == null) return false;

    const formValues = this.externalTitleCreationForm.value;
    const movieMetadata = this.selectedMovie.metadata;

    if (formValues.title !== movieMetadata.name) return true;

    if (formValues.summary !== movieMetadata.summary) return true;

    if (formValues.originallyReleasedAt == null) return false;

    const formDate = formatDate(new Date(formValues.originallyReleasedAt));
    const movieDate = formatDate(new Date(movieMetadata.releaseDate));
    if (formDate !== movieDate) return true;

    if (formValues.runtimeMinutes?.toString() !== movieMetadata.runtime.toString()) return true;

    return false;
  }
}
