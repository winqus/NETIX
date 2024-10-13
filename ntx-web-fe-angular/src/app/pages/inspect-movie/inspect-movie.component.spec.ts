import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InspectMovieComponent } from './inspect-movie.component';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { PosterService } from '@ntx-shared/services/posters/posters.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MovieDTO, UpdateMovieDTO } from '@ntx-shared/models/movie.dto';
import { PosterSize } from '@ntx-shared/models/posterSize.enum';

describe('InspectMovieComponent', () => {
  let component: InspectMovieComponent;
  let fixture: ComponentFixture<InspectMovieComponent>;
  let mockMovieService: any;
  let mockPosterService: any;
  let mockActivatedRoute: any;

  const mockMovie: MovieDTO = {
    id: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Test Movie',
    summary: 'This is a test movie.',
    originallyReleasedAt: new Date(),
    runtimeMinutes: 120,
    posterID: 'poster123',
    isPublished: true,
  };

  beforeEach(async () => {
    mockMovieService = {
      getMovieMetadata: jasmine.createSpy('getMovieMetadata').and.returnValue(of(mockMovie)),
      updateMovieMetadata: jasmine.createSpy('updateMovieMetadata').and.returnValue(of(mockMovie)),
      publishMovie: jasmine.createSpy('publishMovie').and.returnValue(of({ ...mockMovie, isPublished: true })),
      unPublishMovie: jasmine.createSpy('unPublishMovie').and.returnValue(of({ ...mockMovie, isPublished: false })),
    };

    mockPosterService = {
      getPoster: jasmine.createSpy('getPoster').and.returnValue(of(new Blob([''], { type: 'image/jpeg' }))),
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [InspectMovieComponent],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: PosterService, useValue: mockPosterService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InspectMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch movie metadata on init', () => {
    expect(mockMovieService.getMovieMetadata).toHaveBeenCalledWith('1');
    expect(component.movie).toEqual(mockMovie);
  });

  it('should fetch poster immediately if not from creation', () => {
    component.isFromCreation = false;
    fixture.detectChanges();
    expect(mockPosterService.getPoster).toHaveBeenCalledWith(mockMovie.posterID, PosterSize.L);
  });

  describe('Publishing and Unpublishing', () => {
    it('should publish the movie when it is not published', () => {
      component.movie = { ...mockMovie, isPublished: false };
      component.onToggleMoviePublish();

      expect(mockMovieService.publishMovie).toHaveBeenCalledWith('1');
      expect(component.movie?.isPublished).toBeTrue();
    });

    it('should unpublish the movie when it is already published', () => {
      component.movie = { ...mockMovie, isPublished: true };
      component.onToggleMoviePublish();

      expect(mockMovieService.unpublishMovie).toHaveBeenCalledWith('1');
      expect(component.movie?.isPublished).toBeFalse();
    });

    it('should handle error while publishing the movie', () => {
      spyOn(console, 'error');
      component.movie = { ...mockMovie, isPublished: false };

      mockMovieService.publishMovie.and.returnValue(throwError(() => new Error('Error publishing movie')));

      component.onToggleMoviePublish();

      expect(mockMovieService.publishMovie).toHaveBeenCalledWith('1');
      expect(console.error).toHaveBeenCalledWith('Error publishing movie:', jasmine.any(Error));
    });

    it('should handle error while unpublishing the movie', () => {
      spyOn(console, 'error');
      component.movie = { ...mockMovie, isPublished: true };

      mockMovieService.unPublishMovie.and.returnValue(throwError(() => new Error('Error unpublishing movie')));

      component.onToggleMoviePublish();

      expect(mockMovieService.unpublishMovie).toHaveBeenCalledWith('1');
      expect(console.error).toHaveBeenCalledWith('Error unpublishing movie:', jasmine.any(Error));
    });
  });
});
