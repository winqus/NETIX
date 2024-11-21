import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewMovieComponent } from './view-movie.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { VideoService } from '@ntx/app/shared/services/videos/video.service';
import { PosterService } from '@ntx/app/shared/services/posters/posters.service';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { ImageService } from '@ntx/app/shared/services/image.service';
import { of } from 'rxjs';

describe('ViewMovieComponent', () => {
  let component: ViewMovieComponent;
  let fixture: ComponentFixture<ViewMovieComponent>;
  let mockMovieService: any;
  let mockPosterService: any;
  let mockImageService: any;
  let mockActivatedRoute: any;
  let mockVideoService: any;
  let mockRouter: any;

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
    // Mocking dependencies
    mockMovieService = {
      getMovieMetadata: jasmine.createSpy('getMovieMetadata').and.returnValue(of(mockMovie)),
    };

    mockPosterService = {
      getPoster: jasmine.createSpy('getPoster').and.returnValue(of(new Blob([''], { type: 'image/webp' }))),
      getBackdrop: jasmine.createSpy('getBackdrop').and.returnValue(of(new Blob([''], { type: 'image/jpeg' }))),
    };

    mockImageService = {
      getAverageColor: jasmine.createSpy('getAverageColor').and.returnValue(Promise.resolve({ r: 100, g: 150, b: 200 })),
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1'),
        },
      },
    };

    mockVideoService = jasmine.createSpyObj('VideoService', ['getVideoPropsUrl']);
    mockVideoService.getVideoPropsUrl.and.returnValue(of({ name: 'Test Video' }));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // TestBed configuration
    await TestBed.configureTestingModule({
      imports: [ViewMovieComponent], // Standalone component
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: PosterService, useValue: mockPosterService },
        { provide: ImageService, useValue: mockImageService },
        { provide: VideoService, useValue: mockVideoService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    // Component initialization
    fixture = TestBed.createComponent(ViewMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch movie metadata on initialization', () => {
    expect(mockMovieService.getMovieMetadata).toHaveBeenCalledWith('1');
    expect(component.movie).toEqual(mockMovie);
  });

  it('should navigate to watch movie page when onWatchMovie is called', () => {
    component.movie = mockMovie;
    component.onWatchMovie();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/watch/movie', '1']);
  });

  it('should return video name if video is available', () => {
    component.video = { name: 'Test Video' } as any;
    expect(component.getVideoName()).toBe('Test Video');
  });

  it('should return runtime label correctly formatted', () => {
    component.movie = { ...mockMovie, runtimeMinutes: 125 };
    expect(component.getRuntimeLabel()).toBe('2h 5m');
  });
});
