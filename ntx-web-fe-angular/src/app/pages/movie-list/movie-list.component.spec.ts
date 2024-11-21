import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieListComponent } from './movie-list.component';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { testMovieFixture } from '@ntx-shared/services/movie/movieTestData';

describe('MovieListComponent', () => {
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
  let mockMovieService: any;
  let mockErrorHandlerService: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockMovieService = {
      getMovies: jasmine.createSpy('getMovies').and.returnValue(of(testMovieFixture)),
    };
    mockErrorHandlerService = {
      showError: jasmine.createSpy('showError'),
      showSuccess: jasmine.createSpy('showSuccess'),
    };
    mockActivatedRoute = {
      data: of({ movieCardRedirect: 'inspect/movie' }),
    };

    await TestBed.configureTestingModule({
      imports: [MovieListComponent], // For standalone components
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: ErrorHandlerService, useValue: mockErrorHandlerService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch movies on init and set isLoadingMovies to false', () => {
    expect(mockMovieService.getMovies).toHaveBeenCalled();
    expect(component.movies).toEqual(testMovieFixture);
    expect(component.isLoadingMovies).toBeFalse();
  });

  it('should sort movies by originallyReleasedAt in descending order', () => {
    const sortedMovies = [...testMovieFixture].sort((a, b) => new Date(b.originallyReleasedAt).getTime() - new Date(a.originallyReleasedAt).getTime());
    expect(component.movies).toEqual(sortedMovies);
  });

  it('should set redirectUrl from ActivatedRoute data', () => {
    expect(component.getRedirectUrl()).toBe('inspect/movie');
  });

  it('should determine if a movie is published based on redirectUrl and movie data', () => {
    const unpublishedMovie = { isPublished: false } as any;
    const publishedMovie = { isPublished: true } as any;

    expect(component.isMoviePublished(unpublishedMovie)).toBeTrue();
    expect(component.isMoviePublished(publishedMovie)).toBeTrue();
  });
});
