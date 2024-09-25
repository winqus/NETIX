import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ImageService } from '@ntx-shared/services/image.service';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { FieldRestrictions, MediaConstants } from '@ntx/app/shared/config/constants';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { environment } from '@ntx/environments/environment';
import { Router } from '@angular/router';
import { SearchBarComponent } from '@ntx-pages/create-title/import-title/components/search-bar/search-bar.component';

@Component({
  selector: 'app-import-title',
  standalone: true,
  imports: [ImageUploadComponent, ReactiveFormsModule, SearchBarComponent],
  templateUrl: './import-title.component.html',
})
export class ImportTitleComponent implements OnInit {
  @ViewChild('croppModal') cropModalElement!: ElementRef<HTMLDialogElement>;
  @ViewChild(ImageUploadComponent) imageFileComponent!: ImageUploadComponent;

  imageFile: File | null = null;
  imageAccept: string = '';
  imageMaxSize: number = 0;
  errorMessage: string = '';

  titleNames: string[] = [];

  titleCreationForm = new FormGroup({
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
    private imageService: ImageService,
    private uploadMovie: MovieService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<any> {
    this.imageAccept = MediaConstants.image.formats.join(',');
    this.imageMaxSize = MediaConstants.image.maxSize;
  }

  get title() {
    return this.titleCreationForm.get('title');
  }

  get summary() {
    return this.titleCreationForm.get('summary');
  }

  get originallyReleasedAt() {
    return this.titleCreationForm.get('originallyReleasedAt');
  }

  get runtimeMinutes() {
    return this.titleCreationForm.get('runtimeMinutes');
  }

  isFormValid(): boolean {
    return this.titleCreationForm.valid && this.imageFile !== null;
  }

  onSubmit() {
    if (this.titleCreationForm.valid) {
      const formData = new FormData();
      formData.append('name', this.title?.value as string);
      formData.append('summary', this.summary?.value as string);
      formData.append('originallyReleasedAt', this.originallyReleasedAt?.value as string);
      formData.append('runtimeMinutes', this.runtimeMinutes?.value as string);
      formData.append('poster', this.imageFile as Blob);

      this.uploadMovie.uploadMovieMetadata(formData).subscribe({
        next: (response) => {
          if (environment.development) console.log('Upload successful:', response);
          const movieId = response.id;
          this.router.navigate(['/movie', movieId]);
        },
        error: (errorResponse) => {
          this.errorMessage = errorResponse.error.message;
          if (environment.development) console.error('Error uploading metadata:', errorResponse);
        },
      });
    }
  }

  async receiveImageFile(file: File | null) {
    if (file !== null) {
      this.imageFile = await this.imageService.compressImage(file);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.titleCreationForm.get(controlName);
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
    const control = this.titleCreationForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  onTitleSelected(title: any) {
    this.updateFields(title);
    //enable import button
    this.isFormValid();
  }

  updateFields(title: any) {
    this.titleCreationForm.patchValue({ title: title.name });
    this.titleCreationForm.patchValue({ summary: title.summary || title.name + ' summary blablabla' });
  }
}
