import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InspectMovieComponent } from './inspect-movie.component';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { PosterService } from '@ntx-shared/services/posters/posters.service';
import { ActivatedRoute } from '@angular/router';
import { of, timer } from 'rxjs';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { PosterSize } from '@ntx-shared/models/posterSize.enum';
import { ImageService } from '@ntx/app/shared/services/image.service';

describe('InspectMovieComponent', () => {
  let component: InspectMovieComponent;
  let fixture: ComponentFixture<InspectMovieComponent>;
  let mockMovieService: any;
  let mockPosterService: any;
  let mockImageService: any;
  let mockActivatedRoute: any;

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

    await TestBed.configureTestingModule({
      imports: [InspectMovieComponent],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: PosterService, useValue: mockPosterService },
        { provide: ImageService, useValue: mockImageService },
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
});
