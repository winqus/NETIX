import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadTitleComponent } from './upload-title.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UploadService } from '@ntx/app/shared/services/upload/upload.service';

describe('UploadContentComponent', () => {
  let component: UploadTitleComponent;
  let fixture: ComponentFixture<UploadTitleComponent>;
  let mockUploadService: any;

  beforeEach(async () => {
    mockUploadService = jasmine.createSpyObj('UploadService', ['uploadMovieMetadata']);
    await TestBed.configureTestingModule({
      imports: [UploadTitleComponent, ReactiveFormsModule],
      providers: [{ provide: UploadService, useValue: mockUploadService }],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should return false when form is invalid', () => {
    component.imageFile = null;
    expect(component.isFormValid()).toBeFalse();
  });

  it('should return true when form is valid and imageFile is set', () => {
    component.mocieTitleCreationForm.controls['title'].setValue('Test Title');
    component.mocieTitleCreationForm.controls['summary'].setValue('Test Summary');
    component.mocieTitleCreationForm.controls['originallyReleasedAt'].setValue('2022-01-01');
    component.mocieTitleCreationForm.controls['runtimeMinutes'].setValue('120');
    component.imageFile = new File([], 'test.jpg');
    expect(component.isFormValid()).toBeTrue();
  });
});
