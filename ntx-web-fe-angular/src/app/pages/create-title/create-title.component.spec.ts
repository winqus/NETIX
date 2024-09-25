import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateTitleComponent } from './create-title.component';
import { UploadTitleComponent } from '@ntx-pages/create-title/upload-title/upload-title.component';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { By } from '@angular/platform-browser';

describe('CreateTitleComponent', () => {
  let component: CreateTitleComponent;
  let fixture: ComponentFixture<CreateTitleComponent>;
  let mockUploadService: any;

  beforeEach(async () => {
    mockUploadService = jasmine.createSpyObj('UploadService', ['uploadMovieMetadata']);

    await TestBed.configureTestingModule({
      imports: [CreateTitleComponent],
      providers: [{ provide: MovieService, useValue: mockUploadService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render UploadContentComponent', () => {
    const uploadContentElement = fixture.debugElement.query(By.directive(UploadTitleComponent));
    expect(uploadContentElement).toBeTruthy();
  });
});
