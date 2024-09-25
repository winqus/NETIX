import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ImageService } from '@ntx-shared/services/image.service';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { FieldRestrictions, MediaConstants, KeyCode } from '@ntx/app/shared/config/constants';
import { UploadService } from '@ntx/app/shared/services/upload/upload.service';
import { environment } from '@ntx/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-title',
  standalone: true,
  imports: [ImageUploadComponent, ReactiveFormsModule],
  templateUrl: './upload-title.component.html',
})
export class UploadTitleComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('croppModal') cropModalElement!: ElementRef<HTMLDialogElement>;
  @ViewChild(ImageUploadComponent) imageFileComponent!: ImageUploadComponent;

  imageFile: File | null = null;

  imageAccept: string = '';
  imageMaxSize: number = 0;

  errorMessage: string = '';

  mocieTitleCreationForm = new FormGroup({
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
    private upload: UploadService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<any> {
    this.imageAccept = MediaConstants.image.formats.join(',');
    this.imageMaxSize = MediaConstants.image.maxSize;
  }

  isFormValid(): boolean {
    return this.mocieTitleCreationForm.valid && this.imageFile !== null;
  }

  onSubmit() {
    if (this.mocieTitleCreationForm.valid) {
      const formData = new FormData();
      formData.append('name', this.mocieTitleCreationForm.get('title')?.value as string);
      formData.append('summary', this.mocieTitleCreationForm.get('summary')?.value as string);
      formData.append('originallyReleasedAt', this.mocieTitleCreationForm.get('originallyReleasedAt')?.value as string);
      formData.append('runtimeMinutes', this.mocieTitleCreationForm.get('runtimeMinutes')?.value as string);
      formData.append('poster', this.imageFile as Blob);

      this.upload.uploadMovieMetadata(formData).subscribe({
        next: (response) => {
          if (environment.development) console.log('Upload successful:', response);
          const movieId = response.id;
          this.router.navigate(['/inspect/movies', movieId]);
        },
        error: (errorResponse) => {
          this.errorMessage = errorResponse.error.message;
          if (environment.development) console.error('Error uploading metadata:', errorResponse);
        },
      });
    }
  }

  ngAfterViewInit() {
    this.preventEscClose();
  }

  ngOnDestroy() {
    this.removeEscPrevent();
  }

  preventEscClose() {
    if (this.cropModalElement && this.cropModalElement.nativeElement) {
      this.cropModalElement.nativeElement.addEventListener('keydown', this.preventEsc);
    }
  }

  removeEscPrevent() {
    if (this.cropModalElement && this.cropModalElement.nativeElement) {
      this.cropModalElement.nativeElement.removeEventListener('keydown', this.preventEsc);
    }
  }

  preventEsc = (event: KeyboardEvent) => {
    if (event.key === KeyCode.Escape) {
      event.preventDefault();
    }
  };

  async recieveImageFile(file: File | null) {
    if (file !== null) {
      this.imageFile = await this.imageService.compressImage(file);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.mocieTitleCreationForm.get(controlName);
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
    const control = this.mocieTitleCreationForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
