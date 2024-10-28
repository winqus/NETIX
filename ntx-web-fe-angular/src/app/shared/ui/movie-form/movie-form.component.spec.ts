import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieFormComponent } from './movie-form.component';
import { MovieDTO } from '@ntx-shared/models/movie.dto';

describe('MovieFormComponent', () => {
  let component: MovieFormComponent;
  let fixture: ComponentFixture<MovieFormComponent>;

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
    await TestBed.configureTestingModule({
      imports: [MovieFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieFormComponent);
    component = fixture.componentInstance;

    component.movie = mockMovie;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
