import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePosterComponent } from './change-poster.component';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { of } from 'rxjs';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';

describe('ChangePosterComponent', () => {
  let component: ChangePosterComponent;
  let fixture: ComponentFixture<ChangePosterComponent>;
  let mockMovieService: any;
  let mockErrorHandlerService: any;

  const mockMovie: MovieDTO = {
    id: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Test Movie',
    summary: 'This is a test movie.',
    originallyReleasedAt: new Date(),
    runtimeMinutes: 120,
    backdropID: '',
    posterID: 'poster123',
    isPublished: true,
  };

  beforeEach(async () => {
    mockMovieService = {
      getMovieMetadata: jasmine.createSpy('getMovieMetadata').and.returnValue(of(mockMovie)),
      updateMovieMetadata: jasmine.createSpy('updateMovieMetadata').and.returnValue(of(mockMovie)),
      publishMovie: jasmine.createSpy('publishMovie').and.returnValue(of({ ...mockMovie, isPublished: true })),
      unpublishMovie: jasmine.createSpy('unpublishMovie').and.returnValue(of({ ...mockMovie, isPublished: false })),
    };

    mockErrorHandlerService = {
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
    };

    await TestBed.configureTestingModule({
      imports: [ChangePosterComponent],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: ErrorHandlerService, useValue: mockErrorHandlerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
