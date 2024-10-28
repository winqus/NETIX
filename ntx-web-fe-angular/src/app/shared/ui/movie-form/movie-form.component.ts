import { formatDate } from '../../services/utils/utils';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { FieldRestrictions } from '../../config/constants';
import { MovieDTO } from '../../models/movie.dto';
import { SvgIconsComponent } from '../svg-icons/svg-icons.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [SvgIconsComponent, ReactiveFormsModule],
  templateUrl: './movie-form.component.html',
  styleUrl: './movie-form.component.scss',
})
export class MovieFormComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() movie: MovieDTO | undefined;
  @Input() errorMessage: string = '';
  @Output() formGroupChange = new EventEmitter<FormGroup>();

  movieTitleEditForm: FormGroup | null = null;

  private formValueChangesSubscription: Subscription | null = null;

  ngOnInit(): void {
    this.initForm();
  }

  ngAfterViewInit(): void {
    this.initForm();
  }

  ngOnChanges(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    if (this.formValueChangesSubscription) {
      this.formValueChangesSubscription.unsubscribe();
    }
  }

  initForm(): void {
    if (this.movie == null) return;

    this.populateEditForm(this.movie.name, this.movie.summary, this.movie.originallyReleasedAt, this.movie.runtimeMinutes);

    if (this.formValueChangesSubscription) {
      this.formValueChangesSubscription.unsubscribe();
    }

    if (this.movieTitleEditForm) {
      this.formGroupChange.emit(this.movieTitleEditForm);

      this.formValueChangesSubscription = this.movieTitleEditForm.valueChanges.subscribe(() => {
        this.formGroupChange.emit(this.movieTitleEditForm!);
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
