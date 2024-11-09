import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InspectMovieComponent } from './inspect-movie.component';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { PosterService } from '@ntx-shared/services/posters/posters.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { ImageService } from '@ntx-shared/services/image.service';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';
import { VideoService } from '@ntx-shared/services/videos/video.service';
import { VideoRequirementDTO } from '@ntx/app/shared/models/video.dto';

describe('InspectMovieComponent', () => {
  let component: InspectMovieComponent;
  let fixture: ComponentFixture<InspectMovieComponent>;
  let mockMovieService: any;
  let mockPosterService: any;
  let mockImageService: any;
  let mockActivatedRoute: any;
  let mockVideoService: any;
  let mockErrorHandlerService: any;
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

  const mockVideoRequirement: VideoRequirementDTO = {
    allowedExtentions: ['.mkv'],
    maxFileSizeInBytes: 10485760, // 10 MB
    supportedMimeTypes: ['video/mkv'],
  };

  const uploadProgressSubject = new BehaviorSubject<number>(0);

  beforeEach(async () => {
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

    mockVideoService = {
      uploadVideo: jasmine.createSpy('uploadVideo'),
      getVideoRequirements: jasmine.createSpy('getVideoRequirements').and.returnValue(of(mockVideoRequirement)),
      uploadProgress$: uploadProgressSubject.asObservable(),
    };

    mockErrorHandlerService = jasmine.createSpyObj('ErrorHandlerService', ['showError', 'showSuccess']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [InspectMovieComponent],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: PosterService, useValue: mockPosterService },
        { provide: ImageService, useValue: mockImageService },
        { provide: VideoService, useValue: mockVideoService },
        { provide: ErrorHandlerService, useValue: mockErrorHandlerService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InspectMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve movie metadata on initialization and set poster and backdrop URLs', () => {
    component.ngOnInit();
    expect(mockMovieService.getMovieMetadata).toHaveBeenCalledWith('1');
    expect(component.movie).toEqual(mockMovie);
  });

  it('should handle errors when loading movie metadata', () => {
    const consoleSpy = spyOn(console, 'error');
    mockMovieService.getMovieMetadata.and.returnValue(throwError(() => new Error('Metadata load error')));

    component.ngOnInit();

    expect(consoleSpy).toHaveBeenCalledWith('Error uploading metadata:', jasmine.any(Error));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['error']);
  });

  it('should display a success message on successful video upload', async () => {
    const testFile = new File([''], 'test-video.mkv', { type: 'video/mkv' });
    mockVideoService.uploadVideo.and.returnValue(Promise.resolve());

    component.onUploadVideo(testFile);
    await fixture.whenStable();

    expect(mockErrorHandlerService.showSuccess).toHaveBeenCalledWith('Video uploaded successfully');
    expect(component.isUploadingVideo).toBe(false);
  });
});
