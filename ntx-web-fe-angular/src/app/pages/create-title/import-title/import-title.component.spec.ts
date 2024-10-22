import { ComponentFixture, TestBed } from '@angular/core/testing';

// Mock services
import { ImportTitleComponent } from './import-title.component';
import { LibraryService } from '@ntx-shared/services/librarySearch/library.service';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { PosterService } from '@ntx/app/shared/services/posters/posters.service';
import { ExternalMovieService } from '@ntx/app/shared/services/externalMovie/externalMovie.service';

describe('ImportTitleComponent', () => {
  let component: ImportTitleComponent;
  let fixture: ComponentFixture<ImportTitleComponent>;
  let mockLibraryService: any;
  let mockMovieService: any;
  let mockPosterService: any;
  let mockExternalMovieService: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportTitleComponent],
      providers: [
        { provide: LibraryService, useValue: mockLibraryService },
        { provide: MovieService, useValue: mockMovieService },
        { provide: PosterService, useValue: mockPosterService },
        { provide: ExternalMovieService, useValue: mockExternalMovieService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false when form is invalid', () => {
    component.imageFile = null;
    expect(component.isFormValid()).toBeFalse();
  });

  it('should return true when form is valid and imageFile is set', () => {
    component.externalTitleCreationForm.controls['title'].setValue('Test Title');
    component.externalTitleCreationForm.controls['summary'].setValue('Test Summary');
    component.externalTitleCreationForm.controls['originallyReleasedAt'].setValue('2022-01-01');
    component.externalTitleCreationForm.controls['runtimeMinutes'].setValue('120');
    component.imageFile = new File([], 'test.jpg');
    expect(component.isFormValid()).toBeTrue();
  });
});
