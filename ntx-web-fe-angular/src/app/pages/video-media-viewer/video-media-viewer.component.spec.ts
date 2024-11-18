import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { VideoMediaViewerComponent } from './video-media-viewer.component';
import { VideoPlayerService } from '@ntx/app/shared/services/videoPlayer/videoPlayer.service';
import { ElementRef } from '@angular/core';

describe('VideoMediaViewerComponent', () => {
  let component: VideoMediaViewerComponent;
  let fixture: ComponentFixture<VideoMediaViewerComponent>;
  let mockVideoPlayerService: jasmine.SpyObj<VideoPlayerService>;
  let mockActivatedRoute: any;
  let mockGetVideoStream: jasmine.Spy;

  const mockStreamIdValue = 'testStreamID';
  const mockTitleNameValue = 'Test Video Title';
  const mockStreamUrl = 'http://example.com/stream/testStreamID';

  beforeEach(async () => {
    mockVideoPlayerService = jasmine.createSpyObj('VideoPlayerService', [
      'initializePlayer',
      'togglePlay',
      'isPaused',
      'enablePictureInPicture',
      'getCurrentTime',
      'getDuration',
      'getBufferEnd',
      'getVolume',
      'setVolume',
      'toggleMute',
      'isMuted',
      'setCurrentTime',
    ]);

    mockVideoPlayerService.isPaused.and.returnValue(false);
    mockVideoPlayerService.getCurrentTime.and.returnValue(120);
    mockVideoPlayerService.getDuration.and.returnValue(3600);
    mockVideoPlayerService.getBufferEnd.and.returnValue(300);
    mockVideoPlayerService.getVolume.and.returnValue(1);
    mockVideoPlayerService.isMuted.and.returnValue(false);

    mockGetVideoStream = jasmine.createSpy('getVideoStream').and.returnValue(() => {
      return `mockStreamUrl`;
    });

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(mockStreamIdValue),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [VideoMediaViewerComponent],
      providers: [
        { provide: VideoPlayerService, useValue: mockVideoPlayerService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoMediaViewerComponent);
    component = fixture.componentInstance;

    component.videoPlayerElement = new ElementRef(document.createElement('video'));
    component.videoContainer = new ElementRef(document.createElement('div'));

    spyOnProperty(history, 'state', 'get').and.returnValue({ data: mockTitleNameValue });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load stream ID and initialize the video player', async () => {
      component.ngOnInit();

      expect(component.titleName).toBe(mockTitleNameValue);
      expect(component.streamID).toBe(mockStreamIdValue);
    });
  });

  describe('getVideoPlayer', () => {
    it('should return the VideoPlayerService instance', () => {
      expect(component.getVideoPlayer()).toBe(mockVideoPlayerService);
    });
  });

  describe('getVideoTitleLabel', () => {
    it('should return the titleName property', () => {
      component.titleName = 'Test Title';
      expect(component.getVideoTitleLabel()).toBe('Test Title');
    });
  });
});
