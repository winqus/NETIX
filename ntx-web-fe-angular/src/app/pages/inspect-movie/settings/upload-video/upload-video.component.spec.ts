import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadVideoComponent } from './upload-video.component';
import { VideoService } from '@ntx-shared/services/videos/video.service';
import { VideoRequirementDTO } from '@ntx-shared/models/video.dto';
import { ModalService } from '@ntx-shared/services/modal.service';
import { BehaviorSubject, of } from 'rxjs';

describe('UploadVideoComponent', () => {
  let component: UploadVideoComponent;
  let fixture: ComponentFixture<UploadVideoComponent>;
  let mockVideoService: any;
  let mockModalService: any;

  const mockVideoRequirement: VideoRequirementDTO = {
    allowedExtentions: ['.mkv'],
    maxFileSizeInBytes: 10485760, // 10 MB
    supportedMimeTypes: ['video/mkv'],
  };

  const uploadProgressSubject = new BehaviorSubject<number>(0);

  beforeEach(async () => {
    mockVideoService = {
      uploadVideo: jasmine.createSpy('uploadVideo'),
      getVideoRequirements: jasmine.createSpy('getVideoRequirements').and.returnValue(of(mockVideoRequirement)),
      uploadProgress$: uploadProgressSubject.asObservable(),
    };

    mockModalService = {
      openModal: jasmine.createSpy('openModal'),
    };

    await TestBed.configureTestingModule({
      imports: [UploadVideoComponent],
      providers: [
        { provide: VideoService, useValue: mockVideoService },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve video requirements on initialization', () => {
    component.ngOnInit();
    expect(mockVideoService.getVideoRequirements).toHaveBeenCalled();
    expect(component.videoRequirements).toEqual(mockVideoRequirement);
  });

  it('should set accept type based on video requirements', () => {
    component.videoRequirements = mockVideoRequirement;
    const acceptType = component.getVideoAcceptType();
    expect(acceptType).toBe('video/mkv');
  });

  it('should set max file size based on video requirements', () => {
    component.videoRequirements = mockVideoRequirement;
    const maxSize = component.getVideoMaxSize();
    expect(maxSize).toBe(10485760); // 10 MB in bytes
  });

  it('should handle file selection and open confirmation modal', () => {
    const testFile = new File([''], 'test-video.mkv', { type: 'video/mkv' });
    const event = { target: { files: [testFile] } };

    component.onVideoUpload(event);

    expect(component.video).toEqual(testFile);
    expect(mockModalService.openModal).toHaveBeenCalledWith('uploadVideoConfirmPopup', 'Upload video', `Are you sure you want to upload this video: ${testFile.name}`, component.modalButtons);
  });
});
