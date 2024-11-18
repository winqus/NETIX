import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VideoControlsComponent } from './video-controls.component';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons.component';
import { VideoPlayerService } from '@ntx/app/shared/services/videoPlayer/videoPlayer.service';
import { TimelineComponent } from '../timeline/timeline.component';

describe('VideoControlsComponent', () => {
  let component: VideoControlsComponent;
  let fixture: ComponentFixture<VideoControlsComponent>;
  let mockVideoPlayerService: jasmine.SpyObj<VideoPlayerService>;

  beforeEach(async () => {
    mockVideoPlayerService = jasmine.createSpyObj('VideoPlayerService', [
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

    await TestBed.configureTestingModule({
      imports: [VideoControlsComponent, SvgIconsComponent, TimelineComponent],
      providers: [{ provide: VideoPlayerService, useValue: mockVideoPlayerService }],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoControlsComponent);
    component = fixture.componentInstance;

    component.videoPlayer = mockVideoPlayerService;
    component.videoContainer = document.createElement('div');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onTogglePlay', () => {
    it('should call togglePlay on videoPlayer', () => {
      component.onTogglePlay();
      expect(mockVideoPlayerService.togglePlay).toHaveBeenCalled();
    });
  });

  describe('getTogglePlayIconName', () => {
    it('should return "play" if video is paused', () => {
      mockVideoPlayerService.isPaused.and.returnValue(true);
      expect(component.getTogglePlayIconName()).toBe('play');
    });

    it('should return "pause" if video is playing', () => {
      mockVideoPlayerService.isPaused.and.returnValue(false);
      expect(component.getTogglePlayIconName()).toBe('pause');
    });
  });

  describe('onToggleFullscreen', () => {
    it('should request fullscreen if not in fullscreen', () => {
      spyOn(component.videoContainer, 'requestFullscreen');
      component.isFullscreen = false;

      component.onToggleFullscreen();

      expect(component.videoContainer.requestFullscreen).toHaveBeenCalled();
      expect(component.isFullscreen).toBeTrue();
    });

    it('should exit fullscreen if already in fullscreen', () => {
      spyOn(document, 'exitFullscreen');
      component.isFullscreen = true;

      component.onToggleFullscreen();

      expect(document.exitFullscreen).toHaveBeenCalled();
      expect(component.isFullscreen).toBeFalse();
    });
  });

  describe('getFullscreenIconName', () => {
    it('should return "exitFullscreen" if fullscreen is active', () => {
      component.isFullscreen = true;
      expect(component.getFullscreenIconName()).toBe('exitFullscreen');
    });

    it('should return "enterFullscreen" if fullscreen is inactive', () => {
      component.isFullscreen = false;
      expect(component.getFullscreenIconName()).toBe('enterFullscreen');
    });
  });

  describe('onEnablePictureInPicture', () => {
    it('should call enablePictureInPicture on videoPlayer', () => {
      component.onEnablePictureInPicture();
      expect(mockVideoPlayerService.enablePictureInPicture).toHaveBeenCalled();
    });
  });

  describe('getFormattedCurrentTime', () => {
    it('should return formatted current time', () => {
      mockVideoPlayerService.getCurrentTime.and.returnValue(65); // 1:05
      expect(component.getFormattedCurrentTime()).toBe('01:05');
    });
  });

  describe('getFormattedDurationTime', () => {
    it('should return formatted duration time', () => {
      mockVideoPlayerService.getDuration.and.returnValue(3605); // 1:00:05
      expect(component.getFormattedDurationTime()).toBe('01:00:05');
    });
  });

  describe('onVolumeChange', () => {
    it('should call setVolume on videoPlayer with the correct volume', () => {
      const event = { target: { value: '0.5' } } as unknown as Event;
      component.onVolumeChange(event);

      expect(mockVideoPlayerService.setVolume).toHaveBeenCalledWith(0.5);
    });

    it('should unmute if muted and volume is changed', () => {
      mockVideoPlayerService.isMuted.and.returnValue(true);
      spyOn(component, 'onToggleMute');

      const event = { target: { value: '0.5' } } as unknown as Event;
      component.onVolumeChange(event);

      expect(component.onToggleMute).toHaveBeenCalled();
    });
  });

  describe('getVolumeIconName', () => {
    it('should return "volume0" if muted or volume is 0', () => {
      mockVideoPlayerService.isMuted.and.returnValue(true);
      component.currentVolume = 0;

      expect(component.getVolumeIconName()).toBe('volume0');
    });

    it('should return "volume1" if volume is greater than 0.7', () => {
      mockVideoPlayerService.isMuted.and.returnValue(false);
      component.currentVolume = 0.8;

      expect(component.getVolumeIconName()).toBe('volume1');
    });

    it('should return "volume05" if volume is between 0.4 and 0.7', () => {
      mockVideoPlayerService.isMuted.and.returnValue(false);
      component.currentVolume = 0.5;

      expect(component.getVolumeIconName()).toBe('volume05');
    });

    it('should return "volume025" if volume is between 0.1 and 0.4', () => {
      mockVideoPlayerService.isMuted.and.returnValue(false);
      component.currentVolume = 0.3;

      expect(component.getVolumeIconName()).toBe('volume025');
    });
  });

  describe('onToggleMute', () => {
    it('should call toggleMute on videoPlayer', () => {
      component.onToggleMute();
      expect(mockVideoPlayerService.toggleMute).toHaveBeenCalled();
    });
  });

  describe('handleKeyboardEvent', () => {
    it('should call onTogglePlay when Space key is pressed', () => {
      const event = new KeyboardEvent('keydown', { code: 'Space' });
      spyOn(component, 'onTogglePlay');
      spyOn(event, 'preventDefault');

      component.handleKeyboardEvent(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.onTogglePlay).toHaveBeenCalled();
    });

    it('should do nothing for non-Space keys', () => {
      const event = new KeyboardEvent('keydown', { code: 'KeyA' });
      spyOn(component, 'onTogglePlay');
      spyOn(event, 'preventDefault');

      component.handleKeyboardEvent(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(component.onTogglePlay).not.toHaveBeenCalled();
    });
  });
});
