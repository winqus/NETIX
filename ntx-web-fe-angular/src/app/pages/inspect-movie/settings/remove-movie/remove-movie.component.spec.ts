import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveMovieComponent } from './remove-movie.component';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';
import { MovieService } from '@ntx-shared/services/movie/movie.service';

describe('RemoveMovieComponent', () => {
  let component: RemoveMovieComponent;
  let fixture: ComponentFixture<RemoveMovieComponent>;
  let mockMovieService: any;
  let mockErrorHandlerService: any;

  beforeEach(async () => {
    mockErrorHandlerService = {
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
    };
    await TestBed.configureTestingModule({
      imports: [RemoveMovieComponent],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: ErrorHandlerService, useValue: mockErrorHandlerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
