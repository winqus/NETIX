import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateTitleComponent } from './create-title.component';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { By } from '@angular/platform-browser';
import { ImportTitleComponent } from './import-title/import-title.component';
import { ExternalMovieService } from '@ntx/app/shared/services/externalMovie/externalMovie.service';
import { PosterService } from '@ntx/app/shared/services/posters/posters.service';
import { LibraryService } from '@ntx/app/shared/services/librarySearch/library.service';

describe('CreateTitleComponent', () => {
  let component: CreateTitleComponent;
  let fixture: ComponentFixture<CreateTitleComponent>;
  let mockUploadService: any;
  let externalMovieService: any;
  let mockPosterService: any;
  let mockLibraryService: any;

  beforeEach(async () => {
    mockUploadService = jasmine.createSpyObj('UploadService', ['uploadMovieMetadata']);

    await TestBed.configureTestingModule({
      imports: [CreateTitleComponent],
      providers: [
        { provide: LibraryService, useValue: mockLibraryService },
        { provide: MovieService, useValue: mockUploadService },
        { provide: ExternalMovieService, useValue: externalMovieService },
        { provide: PosterService, useValue: mockPosterService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render ImportTitleComponent', () => {
    const uploadContentElement = fixture.debugElement.query(By.directive(ImportTitleComponent));
    expect(uploadContentElement).toBeTruthy();
  });
});
