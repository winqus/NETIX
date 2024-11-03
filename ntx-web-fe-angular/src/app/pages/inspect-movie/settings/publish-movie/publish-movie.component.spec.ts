import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishMovieComponent } from './publish-movie.component';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { of } from 'rxjs';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';

describe('PublishMovieComponent', () => {
  let component: PublishMovieComponent;
  let fixture: ComponentFixture<PublishMovieComponent>;
  let mockMovieService: any;

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

    await TestBed.configureTestingModule({
      imports: [PublishMovieComponent],
      providers: [{ provide: MovieService, useValue: mockMovieService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PublishMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
