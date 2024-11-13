import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MovieCardComponent } from './movie-card.component';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { PosterSize } from '@ntx/app/shared/models/posterSize.enum';
import { getPoster } from '@ntx/app/shared/config/api-endpoints';
import { SvgIconsComponent } from '@ntx/app/shared/ui/svg-icons.component';

describe('MovieCardComponent with MovieDTO', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockMovie: MovieDTO = {
    id: '1',
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2020-02-01'),
    name: 'Test Movie',
    summary: 'This is a test movie summary.',
    originallyReleasedAt: new Date('2020-01-09'),
    runtimeMinutes: 120,
    backdropID: '',
    posterID: 'poster123',
    videoID: 'video123',
    isPublished: true,
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [MovieCardComponent, SvgIconsComponent],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct published date from originallyReleasedAt', () => {
    component.movie = mockMovie;
    fixture.detectChanges();

    expect(component.publishedDate).toBe('2020');
  });

  it('should display "-" when movie is not provided', () => {
    component.movie = null;
    fixture.detectChanges();

    expect(component.publishedDate).toBe('-');
  });

  it('should navigate to the correct movie page when navigateToMovie is called', () => {
    component.movie = mockMovie;
    component.navigateToMovie();

    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/inspect/movies', mockMovie.id]);
  });

  it('should not navigate if movie is null', () => {
    component.movie = null;
    component.navigateToMovie();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should return the correct poster source URL based on posterID and PosterSize.L', () => {
    component.movie = mockMovie;
    const posterUrl = getPoster(mockMovie.posterID, PosterSize.L);

    expect(component.posterSource()).toBe(posterUrl);
  });

  it('should return an empty string as poster source if movie is null', () => {
    component.movie = null;

    expect(component.posterSource()).toBe('');
  });

  it('should handle the poster error by setting posterLoaded to false', () => {
    component.onPosterError();
    expect(component.posterLoaded).toBeFalse();
  });

  it('should trigger navigateToMovie when Enter or Space is pressed', () => {
    component.movie = mockMovie;
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });

    spyOn(component, 'navigateToMovie');

    component.onKeydown(enterEvent);
    expect(component.navigateToMovie).toHaveBeenCalled();

    component.onKeydown(spaceEvent);
    expect(component.navigateToMovie).toHaveBeenCalledTimes(2);
  });

  it('should not trigger navigation for keys other than Enter or Space', () => {
    const otherEvent = new KeyboardEvent('keydown', { key: 'a' });
    spyOn(component, 'navigateToMovie');

    component.onKeydown(otherEvent);
    expect(component.navigateToMovie).not.toHaveBeenCalled();
  });
});
