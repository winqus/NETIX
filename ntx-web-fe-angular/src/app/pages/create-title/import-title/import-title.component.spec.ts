import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportTitleComponent } from './import-title.component';
import { Router } from '@angular/router';
import { ExternalMovieService } from '@ntx-shared/services/externalMovie/externalMovie.service';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { PosterService } from '@ntx-shared/services/posters/posters.service';
import { ImageService } from '@ntx-shared/services/image.service';
import { LibraryService } from '@ntx-shared/services/librarySearch/library.service';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';
import { of, throwError } from 'rxjs';
import { ExternalMovieDTO } from '@ntx-shared/models/externalMovie.dto';
import { TitleType } from '@ntx/app/shared/models/titleType.enum';
import { SearchResultDTO } from '@ntx/app/shared/models/searchResult.dto';

describe('ImportTitleComponent', () => {
  let component: ImportTitleComponent;
  let fixture: ComponentFixture<ImportTitleComponent>;
  let mockExternalMovieService: any;
  let mockMovieService: any;
  let mockPosterService: any;
  let mockImageService: any;
  let mockLibraryService: any;
  let mockErrorHandlerService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockExternalMovieService = {
      uploadExternalMovieMetadata: jasmine.createSpy('uploadExternalMovieMetadata').and.returnValue(of({ id: '123' })),
      replaceExternalMoviePoster: jasmine.createSpy('replaceExternalMoviePoster').and.returnValue(of({})),
      getExternalMovieMetadata: jasmine.createSpy('getExternalMovieMetadata').and.returnValue(of({})),
    };
    mockMovieService = {
      updateMovieMetadata: jasmine.createSpy('updateMovieMetadata').and.returnValue(of({})),
      updateBackdrop: jasmine.createSpy('updateBackdrop').and.returnValue(of({})),
    };
    mockPosterService = {
      downloadImage: jasmine.createSpy('downloadImage').and.returnValue(of(new Blob())),
    };
    mockImageService = {
      compressImage: jasmine.createSpy('compressImage').and.returnValue(Promise.resolve(new File([], 'compressed.jpg'))),
      getCropperConfig: jasmine.createSpy('getCropperConfig '),
    };
    mockErrorHandlerService = {
      showError: jasmine.createSpy('showError'),
    };
    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
    };

    await TestBed.configureTestingModule({
      imports: [ImportTitleComponent],
      providers: [
        { provide: LibraryService, useValue: mockLibraryService },
        { provide: ExternalMovieService, useValue: mockExternalMovieService },
        { provide: MovieService, useValue: mockMovieService },
        { provide: PosterService, useValue: mockPosterService },
        { provide: ImageService, useValue: mockImageService },
        { provide: ErrorHandlerService, useValue: mockErrorHandlerService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportTitleComponent);
    component = fixture.componentInstance;

    component.selectedMovie = { externalID: 'test', providerID: 'provider' } as ExternalMovieDTO;
    component.imageFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    component.imageAccept = '.jpg,.jpeg,.png';
    component.errorMessage = '';
    component.selectedResultPosterURL = 'http://example.com/poster.jpg';
    component.importingTitle = true;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isFormValid', () => {
    it('should return false if form is invalid', () => {
      component.imageFile = null;
      expect(component.isFormValid()).toBeFalse();
    });

    it('should return true if form is valid and imageFile is set', () => {
      component.externalTitleCreationForm.controls['title'].setValue('Test Title');
      component.externalTitleCreationForm.controls['summary'].setValue('Test Summary');
      component.externalTitleCreationForm.controls['originallyReleasedAt'].setValue('2022-01-01');
      component.externalTitleCreationForm.controls['runtimeMinutes'].setValue('120');
      component.imageFile = new File([], 'test.jpg');
      expect(component.isFormValid()).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should call uploadExternalMovieMetadata and navigate on success', () => {
      component.externalTitleCreationForm.setValue({
        title: 'Test Movie Title',
        summary: 'Test movie summary description',
        originallyReleasedAt: '2022-01-01',
        runtimeMinutes: '120',
      });

      component.selectedMovie = { externalID: 'test', providerID: 'provider' } as any;
      spyOn(component, 'isFormValid').and.returnValue(true);

      component.onSubmit();

      expect(mockExternalMovieService.uploadExternalMovieMetadata).toHaveBeenCalledWith({
        externalID: 'test',
        externalProviderID: 'provider',
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/inspect/movie', '123'], { state: { from: 'creation' } });
    });

    it('should handle error and show error message on failure', () => {
      component.externalTitleCreationForm.setValue({
        title: 'Test Movie Title',
        summary: 'Test movie summary description',
        originallyReleasedAt: '2022-01-01',
        runtimeMinutes: '120',
      });

      component.selectedMovie = { externalID: 'test', providerID: 'provider' } as any;
      spyOn(component, 'isFormValid').and.returnValue(true);
      mockExternalMovieService.uploadExternalMovieMetadata.and.returnValue(throwError({ error: { message: 'error' } }));

      component.onSubmit();

      expect(mockErrorHandlerService.showError).toHaveBeenCalledWith('An error occurred while importing a movie. Please try again later.', 'Import unsuccessful');
    });

    it('should not proceed if form is invalid', () => {
      spyOn(component, 'isFormValid').and.returnValue(false);
      component.onSubmit();
      expect(mockExternalMovieService.uploadExternalMovieMetadata).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should navigate on successful submission', () => {
      component.externalTitleCreationForm.setValue({
        title: 'Test Movie Title',
        summary: 'Test movie summary description',
        originallyReleasedAt: '2022-01-01',
        runtimeMinutes: '120',
      });

      component.selectedMovie = { externalID: 'test', providerID: 'provider' } as any;
      spyOn(component, 'isFormValid').and.returnValue(true);
      component.onSubmit();
      expect(mockExternalMovieService.uploadExternalMovieMetadata).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/inspect/movie', '123'], { state: { from: 'creation' } });
    });

    it('should handle error and show error message on failure', () => {
      component.externalTitleCreationForm.setValue({
        title: 'Test Movie Title',
        summary: 'Test movie summary description',
        originallyReleasedAt: '2022-01-01',
        runtimeMinutes: '120',
      });

      component.selectedMovie = { externalID: 'test', providerID: 'provider' } as any;
      spyOn(component, 'isFormValid').and.returnValue(true);
      mockExternalMovieService.uploadExternalMovieMetadata.and.returnValue(throwError({ error: { message: 'error' } }));
      component.onSubmit();
      expect(mockErrorHandlerService.showError).toHaveBeenCalledWith('An error occurred while importing a movie. Please try again later.', 'Import unsuccessful');
    });
  });

  describe('uploadPoster', () => {
    it('should call replaceExternalMoviePoster with form data if imageFile is set', () => {
      const movieId = '123';
      component.imageFile = new File([], 'test.jpg');
      component['uploadPoster'](movieId).subscribe();
      expect(mockExternalMovieService.replaceExternalMoviePoster).toHaveBeenCalled();
    });

    it('should handle error and return null on failure', () => {
      const movieId = '123';
      component.imageFile = new File([], 'test.jpg');
      const handleErrorSpy = spyOn<any>(component, 'handleError').and.callThrough();

      mockExternalMovieService.replaceExternalMoviePoster.and.returnValue(throwError({ error: { message: 'error' } }));
      component['uploadPoster'](movieId).subscribe((result) => {
        expect(result).toBeNull();
        expect(handleErrorSpy).toHaveBeenCalledWith({ error: { message: 'error' } }, 'Error uploading external movie poster');
      });
    });
  });

  describe('downloadAndUploadBackdrop', () => {
    it('should call updateBackdrop after successful image download and compression', async () => {
      const movieId = '123';
      component.selectedMovie = { backdropURL: 'test_url' } as any;
      component['downloadAndUploadBackdrop'](movieId).subscribe();
      expect(mockPosterService.downloadImage).toHaveBeenCalled();
      expect(mockImageService.compressImage).toHaveBeenCalled();
    });

    it('should handle error in downloadAndUploadBackdrop process', () => {
      const movieId = '123';
      component.selectedMovie = { backdropURL: 'test_url' } as any;

      const handleErrorSpy = spyOn<any>(component, 'handleError').and.callThrough();

      mockPosterService.downloadImage.and.returnValue(throwError({ error: { message: 'error' } }));
      component['downloadAndUploadBackdrop'](movieId).subscribe((result) => {
        expect(result).toBeNull();
        expect(handleErrorSpy).toHaveBeenCalledWith({ error: { message: 'error' } }, 'Error downloading backdrop');
      });
    });
  });

  describe('getErrorMessage', () => {
    it('should return required field message if control is required', () => {
      const titleControl = component.externalTitleCreationForm.controls['title'];
      titleControl.setErrors({ required: true });
      titleControl.markAsTouched();
      const message = component.getErrorMessage('title');
      expect(message).toBe('This field is required');
    });

    it('should return minimum length message if control has minlength error', () => {
      const titleControl = component.externalTitleCreationForm.controls['title'];
      titleControl.setErrors({ minlength: { requiredLength: 5 } });
      titleControl.markAsTouched();
      const message = component.getErrorMessage('title');
      expect(message).toBe('Minimum length is 5');
    });

    it('should return maximum length message if control has maxlength error', () => {
      const titleControl = component.externalTitleCreationForm.controls['title'];
      titleControl.setErrors({ maxlength: { requiredLength: 100 } });
      titleControl.markAsTouched();
      const message = component.getErrorMessage('title');
      expect(message).toBe('Maximum length is 100');
    });

    it('should return minimum value message if control has min error', () => {
      const runtimeControl = component.externalTitleCreationForm.controls['runtimeMinutes'];
      runtimeControl.setErrors({ min: { min: 60 } });
      runtimeControl.markAsTouched();
      const message = component.getErrorMessage('runtimeMinutes');
      expect(message).toBe('Minimum value is 60');
    });

    it('should return maximum value message if control has max error', () => {
      const runtimeControl = component.externalTitleCreationForm.controls['runtimeMinutes'];
      runtimeControl.setErrors({ max: { max: 300 } });
      runtimeControl.markAsTouched();
      const message = component.getErrorMessage('runtimeMinutes');
      expect(message).toBe('Maximum value is 300');
    });

    it('should return pattern error message if control has pattern error', () => {
      const runtimeControl = component.externalTitleCreationForm.controls['runtimeMinutes'];
      runtimeControl.setErrors({ pattern: true });
      runtimeControl.markAsTouched();
      const message = component.getErrorMessage('runtimeMinutes');
      expect(message).toBe('Runtime has to be integer');
    });

    it('should return default pattern error message if control does not exist', () => {
      const runtimeControl = component.externalTitleCreationForm.controls['title'];
      runtimeControl.setErrors({ pattern: true });
      runtimeControl.markAsTouched();
      const message = component.getErrorMessage('title');
      expect(message).toBe('Invalid format');
    });

    it('should return empty string if control has no errors or is untouched', () => {
      const titleControl = component.externalTitleCreationForm.controls['title'];
      titleControl.setErrors(null);
      titleControl.markAsUntouched();
      const message = component.getErrorMessage('title');
      expect(message).toBe('');
    });
  });

  describe('receiveImageFile', () => {
    it('should set imageFile to the provided file', async () => {
      const testFile = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
      await component.receiveImageFile(testFile);
      expect(component.imageFile).toBe(testFile);
    });

    it('should set imageFile to null if provided file is null', async () => {
      await component.receiveImageFile(null);
      expect(component.imageFile).toBeNull();
    });
  });

  describe('updateFields', () => {
    it('should update form fields with movie metadata', () => {
      const mockMovie: ExternalMovieDTO = {
        metadata: {
          name: 'Test Movie Title',
          summary: 'Test movie summary',
          releaseDate: '2022-01-01',
          runtime: 120,
        },
      } as any;

      component.updateFields(mockMovie);

      expect(component.externalTitleCreationForm.get('title')?.value).toBe('Test Movie Title');
      expect(component.externalTitleCreationForm.get('summary')?.value).toBe('Test movie summary');
      expect(component.externalTitleCreationForm.get('originallyReleasedAt')?.value).toBe('2022-01-01');
      expect(component.externalTitleCreationForm.get('runtimeMinutes')?.value).toBe('120');
    });
  });

  describe('isEdited', () => {
    let mockMovie: ExternalMovieDTO;

    beforeEach(() => {
      mockMovie = {
        externalID: 'test-external-id',
        providerID: 'test-provider-id',
        type: TitleType.MOVIE,
        metadata: {
          name: 'Original Movie Title',
          originalName: 'Original Movie Title',
          summary: 'Original summary',
          releaseDate: '2022-01-01',
          runtime: 120,
        },
        posterURL: 'http://example.com/poster.jpg',
        backdropURL: 'http://example.com/backdrop.jpg',
      };

      component.selectedMovie = mockMovie;

      component.externalTitleCreationForm.setValue({
        title: mockMovie.metadata.name,
        summary: mockMovie.metadata.summary,
        originallyReleasedAt: mockMovie.metadata.releaseDate,
        runtimeMinutes: mockMovie.metadata.runtime.toString(),
      });
    });

    it('should return false when form values match the selected movie metadata', () => {
      expect(component.isEdited()).toBeFalse();
    });

    it('should return true if the title is edited', () => {
      component.externalTitleCreationForm.get('title')?.setValue('New Movie Title');
      expect(component.isEdited()).toBeTrue();
    });

    it('should return true if the summary is edited', () => {
      component.externalTitleCreationForm.get('summary')?.setValue('New summary');
      expect(component.isEdited()).toBeTrue();
    });

    it('should return true if the release date is edited', () => {
      component.externalTitleCreationForm.get('originallyReleasedAt')?.setValue('2023-01-01');
      expect(component.isEdited()).toBeTrue();
    });

    it('should return true if the runtime is edited', () => {
      component.externalTitleCreationForm.get('runtimeMinutes')?.setValue('150');
      expect(component.isEdited()).toBeTrue();
    });

    it('should return false if selectedMovie is null', () => {
      component.selectedMovie = null;
      expect(component.isEdited()).toBeFalse();
    });

    it('should return false if selectedMovie.metadata is null', () => {
      component.selectedMovie = { ...mockMovie, metadata: null } as any;
      expect(component.isEdited()).toBeFalse();
    });

    it('should return false if form value is null for originallyReleasedAt', () => {
      component.externalTitleCreationForm.get('originallyReleasedAt')?.setValue(null);
      expect(component.isEdited()).toBeFalse();
    });
  });

  describe('onMovieSelected', () => {
    let mockResultMovie: SearchResultDTO;

    beforeEach(() => {
      mockResultMovie = {
        item: {
          externalID: 'test-external-id',
          providerID: 'test-provider-id',
          metadata: {
            name: 'Test Movie',
            summary: 'Test Summary',
            releaseDate: '2022-01-01',
            runtime: 120,
          },
          type: TitleType.MOVIE,
        },
      } as any;
    });

    it('should set selectedMovie and call updateFields if resultMovie is valid', () => {
      const mockMovieResponse = {
        externalID: 'test-external-id',
        providerID: 'test-provider-id',
        metadata: {
          name: 'Test Movie',
          summary: 'Test Summary',
          releaseDate: '2022-01-01',
          runtime: 120,
        },
        posterURL: 'http://example.com/poster.jpg',
      } as ExternalMovieDTO;

      spyOn(component, 'updateFields');
      spyOn(component, 'isFormValid');
      mockExternalMovieService.getExternalMovieMetadata.and.returnValue(of(mockMovieResponse));

      component.onMovieSelected(mockResultMovie);

      expect(mockExternalMovieService.getExternalMovieMetadata).toHaveBeenCalledWith('test-external-id', 'test-provider-id');
      expect(component.selectedMovie).toEqual(mockMovieResponse);
      expect(component.updateFields).toHaveBeenCalledWith(mockMovieResponse);
      expect(component.isFormValid).toHaveBeenCalled();
      expect(component.errorMessage).toBe('');
      expect(component.selectedResultPosterURL).toBe('http://example.com/poster.jpg');
    });

    it('should set errorMessage if getExternalMovieMetadata returns an error', () => {
      mockExternalMovieService.getExternalMovieMetadata.and.returnValue(throwError({ error: { message: 'Error loading metadata' } }));

      component.onMovieSelected(mockResultMovie);

      expect(component.errorMessage).toBe('Error loading metadata');
    });

    it('should set errorMessage if downloadImage fails', async () => {
      const mockMovieResponse = {
        externalID: 'test-external-id',
        providerID: 'test-provider-id',
        metadata: {
          name: 'Test Movie',
          summary: 'Test Summary',
          releaseDate: '2022-01-01',
          runtime: 120,
        },
        posterURL: 'http://example.com/poster.jpg',
      } as ExternalMovieDTO;

      mockExternalMovieService.getExternalMovieMetadata.and.returnValue(of(mockMovieResponse));
      mockPosterService.downloadImage.and.returnValue(throwError({ error: { message: 'Error downloading image' } }));

      await component.onMovieSelected(mockResultMovie);

      expect(component.errorMessage).toBe('Error downloading image');
    });

    it('should not proceed if resultMovie is null', () => {
      component.onMovieSelected(null as any);

      expect(mockExternalMovieService.getExternalMovieMetadata).not.toHaveBeenCalled();
    });

    it('should not proceed if resultMovie.item is null', () => {
      component.onMovieSelected({ item: null } as any);

      expect(mockExternalMovieService.getExternalMovieMetadata).not.toHaveBeenCalled();
    });
  });
});
