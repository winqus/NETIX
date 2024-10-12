import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieListComponent } from './movie-list.component';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { of, throwError } from 'rxjs';
import { testMovieFixture } from '@ntx/app/shared/services/movie/movieTestData';
import { environment } from '@ntx/environments/environment.development';

describe('MovieListComponent', () => {
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
  let mockMovieService: any;

  beforeEach(async () => {
    mockMovieService = {
      getMovies: jasmine.createSpy('getMovies').and.returnValue(of(testMovieFixture)),
    };

    await TestBed.configureTestingModule({
      imports: [MovieListComponent],
      providers: [{ provide: MovieService, useValue: mockMovieService }],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch movies on init and set isLoadingMovies to false', () => {
    expect(component.movies).toEqual(testMovieFixture);
    expect(component.isLoadingMovies).toBeFalse(); // Ensure loading state is set to false
  });

  it('should sort movies by originallyReleasedAt in descending order', () => {
    const sortedMovies = [...testMovieFixture].sort((a, b) => new Date(b.originallyReleasedAt).getTime() - new Date(a.originallyReleasedAt).getTime());
    expect(component.movies).toEqual(sortedMovies);
  });

  it('should set isLoadingMovies to false when the movies are loaded', () => {
    expect(component.isLoadingMovies).toBeFalse();
  });

  it('should log the movies response in development mode', () => {
    spyOn(console, 'log');

    component.ngOnInit();

    if (environment.development) {
      expect(console.log).toHaveBeenCalledWith('Get movies:', testMovieFixture);
    } else {
      expect(console.log).not.toHaveBeenCalled();
    }
  });

  it('should log error in development mode when there is an error fetching movies', () => {
    spyOn(console, 'error');
    mockMovieService.getMovies.and.returnValue(throwError(() => new Error('Failed to fetch movies')));

    component.ngOnInit();

    if (environment.development) {
      expect(console.error).toHaveBeenCalledWith('Error getting movies:', jasmine.any(Error));
    } else {
      expect(console.error).not.toHaveBeenCalled();
    }
  });
});
