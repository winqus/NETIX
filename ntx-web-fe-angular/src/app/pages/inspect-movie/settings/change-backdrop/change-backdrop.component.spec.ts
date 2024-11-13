import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeBackdropComponent } from './change-backdrop.component';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { of } from 'rxjs';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';

describe('ChangeBackdropComponent', () => {
  let component: ChangeBackdropComponent;
  let fixture: ComponentFixture<ChangeBackdropComponent>;
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
    backdropID: 'backdrop123',
    posterID: 'poster123',
    isPublished: true,
  };

  beforeEach(async () => {
    mockErrorHandlerService = {
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
    };
    mockMovieService = {
      getMovieMetadata: jasmine.createSpy('getMovieMetadata').and.returnValue(of(mockMovie)),
      updateMovieMetadata: jasmine.createSpy('updateMovieMetadata').and.returnValue(of(mockMovie)),
      publishMovie: jasmine.createSpy('publishMovie').and.returnValue(of({ ...mockMovie, isPublished: true })),
      unpublishMovie: jasmine.createSpy('unpublishMovie').and.returnValue(of({ ...mockMovie, isPublished: false })),
    };

    await TestBed.configureTestingModule({
      imports: [ChangeBackdropComponent],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: ErrorHandlerService, useValue: mockErrorHandlerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeBackdropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
