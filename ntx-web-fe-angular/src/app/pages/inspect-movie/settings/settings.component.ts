import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { MovieDTO, UpdateMovieDTO } from '@ntx-shared/models/movie.dto';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';
import { ModalService } from '@ntx-shared/services/modal.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '@ntx/environments/environment.development';
import { formatDate } from '@ntx-shared/services/utils/utils';
import { FieldRestrictions } from '@ntx/app/shared/config/constants';
import { ImageUploadComponent } from '@ntx-shared/ui/image-upload/image-upload.component';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { ChangePosterComponent } from './change-poster/change-poster.component';
import { PublishMovieComponent } from './publish-movie/publish-movie.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SvgIconsComponent, ReactiveFormsModule, ImageUploadComponent, ChangePosterComponent, PublishMovieComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnChanges {
  @Input({ required: true }) movie: MovieDTO | undefined;
  @ViewChild('editModal') editModal!: ElementRef<HTMLDialogElement>;

  movieTitleEditForm: FormGroup | null = null;
  errorMessage: string = '';
  imageAccept: string | undefined;
  newPosterImg: File | null = null;
  tempPosterImgUrl: string = '';

  constructor(
    private modalService: ModalService,
    private movieService: MovieService
  ) {}

  ngOnChanges(): void {
    if (this.movie == null) return;

    this.populateEditForm(this.movie.name, this.movie.summary, this.movie.originallyReleasedAt, this.movie.runtimeMinutes);
    console.log(this.movie);
    console.log(this.movieTitleEditForm);
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
        next: (response: MovieDTO | undefined) => {
          if (environment.development) console.log('Update successful:', response);
          this.editModal.nativeElement.close();
          this.movie = response;
        },
        error: (errorResponse: { error: { message: string } }) => {
          this.errorMessage = errorResponse.error.message;
          if (environment.development) console.error('Error updating metadata:', errorResponse);
        },
      });
    }
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
