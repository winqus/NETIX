import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateTitleComponent } from './create-title.component';
import { UploadContentComponent } from '@ntx-pages/create-title/upload-content/upload-content.component';
import { UploadService } from '@ntx/app/shared/services/upload/upload.service';
import { By } from '@angular/platform-browser';

describe('CreateTitleComponent', () => {
  let component: CreateTitleComponent;
  let fixture: ComponentFixture<CreateTitleComponent>;
  let mockUploadService: any;

  beforeEach(async () => {
    mockUploadService = jasmine.createSpyObj('UploadService', ['uploadMovieMetadata']);

    await TestBed.configureTestingModule({
      imports: [CreateTitleComponent],
      providers: [{ provide: UploadService, useValue: mockUploadService }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render UploadContentComponent', () => {
    const uploadContentElement = fixture.debugElement.query(By.directive(UploadContentComponent));
    expect(uploadContentElement).toBeTruthy();
  });
});
