import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, concatMap, from, of, switchMap, tap } from 'rxjs';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadComponent } from '@ntx-shared/ui/image-upload/image-upload.component';
import { FieldRestrictions, MediaConstants } from '@ntx-shared/config/constants';
import { ExternalMovieService } from '@ntx-shared/services/externalMovie/externalMovie.service';
import { environment } from '@ntx/environments/environment';
import { SearchBarComponent } from '@ntx-shared/ui/search-bar/search-bar.component';
import { Provider } from '@ntx-shared/models/librarySearch.dto';
import { ExternalMovieDTO } from '@ntx-shared/models/externalMovie.dto';
import { PosterService } from '@ntx-shared/services/posters/posters.service';
import { formatDate } from '@ntx-shared/services/utils/utils';
import { UpdateMovieDTO } from '@ntx-shared/models/movie.dto';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { SearchResultDTO } from '@ntx-shared/models/searchResult.dto';
import { ImageService } from '@ntx-shared/services/image.service';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons.component';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';

@Component({
  selector: 'app-import-title',
  standalone: true,
  imports: [ImageUploadComponent, ReactiveFormsModule, SearchBarComponent, SvgIconsComponent],
  templateUrl: './import-title.component.html',
})
export class ImportTitleComponent implements OnInit {
  selectedMovie: ExternalMovieDTO | null = null;
  imageFile: File | null = null;
  imageAccept: string = '';
  errorMessage: string = '';
  selectedResultPosterURL: string | null = null;
  importingTitle: boolean = false;

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
    private readonly movieService: MovieService,
    private readonly externalMovie: ExternalMovieService,
    private readonly posterService: PosterService,
    private readonly imageService: ImageService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<any> {
    this.imageAccept = MediaConstants.image.formats.join(',');
  }

  isFormValid(): boolean {
    return this.externalTitleCreationForm.valid && this.imageFile !== null;
  }

  onSubmit() {
    if (!this.externalTitleCreationForm.valid || !this.selectedMovie) return;

    let movieId = '';
    this.importingTitle = true;

    this.externalMovie
      .uploadExternalMovieMetadata({
        externalID: this.selectedMovie.externalID,
        externalProviderID: this.selectedMovie.providerID,
      })
      .pipe(
        tap((response) => {
          if (environment.development) console.log('External movie upload successful:', response);
          movieId = response.id;
        }),
        switchMap(() => this.uploadPoster(movieId)),
        switchMap(() => this.updateMovieMetadata(movieId)),
        switchMap(() => this.downloadAndUploadBackdrop(movieId))
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/inspect/movies', movieId], { state: { from: 'creation' } });
        },
        error: (errorResponse) => {
          this.handleError(errorResponse);
          this.errorHandler.showError('An error occurred while importing a movie. Please try again later.', 'Import unsuccessful');
        },
      });
  }

  private uploadPoster(movieId: string) {
    if (!this.imageFile) return of(null);

    const posterFormData = new FormData();
    posterFormData.append('poster', this.imageFile);

    return this.externalMovie.replaceExternalMoviePoster(movieId, posterFormData).pipe(
      tap((response) => {
        if (environment.development) console.log('External movie poster upload successful:', response);
      }),
      catchError((errorResponse) => {
        this.handleError(errorResponse, 'Error uploading external movie poster');
        return of(null);
      })
    );
  }

  private updateMovieMetadata(movieId: string) {
    if (!this.isEdited() || !this.externalTitleCreationForm.valid) return of(null);

    const movieData: UpdateMovieDTO = {
      name: this.externalTitleCreationForm.get('title')?.value ?? '',
      summary: this.externalTitleCreationForm.get('summary')?.value ?? '',
      originallyReleasedAt: new Date(this.externalTitleCreationForm.get('originallyReleasedAt')?.value ?? ''),
      runtimeMinutes: parseInt(this.externalTitleCreationForm.get('runtimeMinutes')?.value ?? ''),
    };

    return this.movieService.updateMovieMetadata(movieId, movieData).pipe(
      tap((response) => {
        if (environment.development) console.log('Update successful:', response);
      }),
      catchError((errorResponse) => {
        this.handleError(errorResponse, 'Error updating metadata');
        return of(null);
      })
    );
  }

  private downloadAndUploadBackdrop(movieId: string) {
    if (!this.selectedMovie?.backdropURL) return of(null);

    return this.posterService.downloadImage(this.selectedMovie.backdropURL).pipe(
      concatMap((blob) => {
        const backdropFile = new File([blob], 'backdrop.' + MediaConstants.image.exportFileExtension, {
          type: MediaConstants.image.exportMimeType,
          lastModified: Date.now(),
        });

        return from(this.imageService.compressImage(backdropFile)).pipe(
          concatMap((compressedBackdropImgFile) => {
            const formData = new FormData();
            formData.append('backdrop', compressedBackdropImgFile as Blob);

            if (environment.development) console.log('Backdrop download and compression successful:', compressedBackdropImgFile);

            return this.movieService.updateBackdrop(movieId, formData).pipe(
              tap((response) => {
                if (environment.development) console.log('Backdrop update successful:', response);
              }),
              catchError((errorResponse) => {
                this.handleError(errorResponse, 'Error uploading backdrop');
                return of(null);
              })
            );
          })
        );
      }),
      catchError((errorResponse) => {
        this.handleError(errorResponse, 'Error downloading backdrop');
        return of(null);
      })
    );
  }

  private handleError(errorResponse: any, message: string = 'Error in submission process') {
    this.importingTitle = false;
    this.errorMessage = errorResponse.error.message;
    if (environment.development) console.error(message, errorResponse);
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
        return FieldRestrictions.runtimeMinutes.patternError;
      default:
        return 'Invalid format';
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.externalTitleCreationForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  getProviders() {
    return Provider.NTX_DISCOVERY.toString();
  }

  onMovieSelected(resultMovie: SearchResultDTO) {
    if (resultMovie == null || resultMovie.item === null) return;

    const externalMovieItem = resultMovie.item;

    this.externalMovie.getExternalMovieMetadata(externalMovieItem.externalID, externalMovieItem.providerID).subscribe({
      next: (response) => {
        if (environment.development) console.log('External movie load successful:', response);
        this.selectedMovie = response;

        this.updateFields(this.selectedMovie);
        this.isFormValid();

        this.errorMessage = '';
        if (this.selectedMovie.posterURL != null) {
          this.selectedResultPosterURL = this.selectedMovie.posterURL;

          this.posterService.downloadImage(this.selectedResultPosterURL).subscribe({
            next: async (blob) => {
              this.imageFile = new File([blob], externalMovieItem.metadata.name + '.' + MediaConstants.image.exportFileExtension, {
                type: MediaConstants.image.exportMimeType,
                lastModified: Date.now(),
              });

              this.imageFile = await this.imageService.compressImage(this.imageFile);
            },
            error: (errorResponse) => {
              this.errorMessage = errorResponse.error.message;
              if (environment.development) console.error('Error loading external movie metadata:', errorResponse);
            },
          });
        }
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
