import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ImageUploadComponent } from '@ntx-shared/ui/image-upload/image-upload.component';
import { FieldRestrictions, MediaConstants } from '@ntx-shared/config/constants';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { environment } from '@ntx/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-title',
  standalone: true,
  imports: [ImageUploadComponent, ReactiveFormsModule],
  templateUrl: './upload-title.component.html',
})
export class UploadTitleComponent implements OnInit {
  imageFile: File | null = null;

  imageAccept: string = '';
  errorMessage: string = '';

  movieTitleCreationForm = new FormGroup({
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
    private uploadMovie: MovieService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<any> {
    this.imageAccept = MediaConstants.image.formats.join(',');
  }

  isFormValid(): boolean {
    return this.movieTitleCreationForm.valid && this.imageFile !== null;
  }

  onSubmit() {
    if (this.movieTitleCreationForm.valid) {
      const formData = new FormData();
      formData.append('name', this.movieTitleCreationForm.get('title')?.value as string);
      formData.append('summary', this.movieTitleCreationForm.get('summary')?.value as string);
      formData.append('originallyReleasedAt', this.movieTitleCreationForm.get('originallyReleasedAt')?.value as string);
      formData.append('runtimeMinutes', this.movieTitleCreationForm.get('runtimeMinutes')?.value as string);
      formData.append('poster', this.imageFile as Blob);

      this.uploadMovie.uploadMovieMetadata(formData).subscribe({
        next: (response) => {
          if (environment.development) console.log('Upload successful:', response);
          const movieId = response.id;
          this.router.navigate(['/inspect/movies', movieId], { state: { from: 'creation' } });
        },
        error: (errorResponse) => {
          this.errorMessage = errorResponse.error.message;
          if (environment.development) console.error('Error uploading metadata:', errorResponse);
        },
      });
    }
  }

  async recieveImageFile(file: File | null) {
    this.imageFile = file;
  }

  getErrorMessage(controlName: string): string {
    const control = this.movieTitleCreationForm.get(controlName);
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
    const control = this.movieTitleCreationForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
