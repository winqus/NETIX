import { AfterViewInit, Component, HostListener, Input, OnDestroy } from '@angular/core';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons.component';
import { formatTime } from '@ntx-shared/services/utils/utils';
import { filter, fromEvent, interval, Subject, Subscription, switchMap, takeWhile, timer } from 'rxjs';
import { VideoPlayerService } from '@ntx-shared/services/videoPlayer/videoPlayer.service';
import { TimelineComponent } from '../timeline/timeline.component';

@Component({
  selector: 'app-video-controls',
  standalone: true,
  imports: [SvgIconsComponent, TimelineComponent],
  templateUrl: './video-controls.component.html',
  styleUrls: ['./video-controls.component.scss'],
})
export class VideoControlsComponent implements OnDestroy, AfterViewInit {
  @Input({ required: true }) videoContainer!: HTMLElement;
  @Input({ required: true }) videoPlayer!: VideoPlayerService;
  @Input() titleName: string = '';

  private readonly playbackSpeed2x = 2.0;
  private readonly defaultPlaybackSpeed = 1.0;
  private readonly idleThreshold = 3000;
  private fullscreenChangeSubscription!: Subscription;
  private spaceHoldInterval!: Subscription;
  private readonly mouseMoveSubject = new Subject<void>();
  private isSpaceHeld: boolean = false;
  private isSpeedToggled: boolean = false;

  currentVolume: number = 1.0;
  isFullscreen: boolean = false;
  isVolumeSliderVisible: boolean = true;
  controlsVisible: boolean = true;

  ngAfterViewInit(): void {
    this.fullscreenChangeSubscription = fromEvent(document, 'fullscreenchange').subscribe(() => {
      this.isFullscreen = !!document.fullscreenElement;
    });

    this.mouseMoveSubject
      .pipe(
        switchMap(() => {
          this.controlsVisible = true;
          return timer(this.idleThreshold);
        })
      )
      .subscribe(() => {
        this.controlsVisible = false;
      });

    this.currentVolume = this.videoPlayer.getVolume();
  }

  ngOnDestroy(): void {
    this.mouseMoveSubject.complete();
    if (this.fullscreenChangeSubscription) {
      this.fullscreenChangeSubscription.unsubscribe();
    }

    if (this.spaceHoldInterval) {
      this.spaceHoldInterval.unsubscribe();
    }

    this.isSpaceHeld = false;
    this.isSpeedToggled = false;
  }

  onTogglePlay(): void {
    this.videoPlayer.togglePlay();
  }

  getTogglePlayIconName(): string {
    return this.videoPlayer.isPaused() ? 'play' : 'pause';
  }

  onToggleFullscreen(): void {
    const elem = this.videoContainer;

    if (!this.isFullscreen) {
      elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    this.isFullscreen = !this.isFullscreen;
  }

  getFullscreenIconName(): string {
    return this.isFullscreen ? 'exitFullscreen' : 'enterFullscreen';
  }

  onEnablePictureInPicture(): void {
    this.videoPlayer.enablePictureInPicture();
  }

  getPictureInPictureIconName(): string {
    return 'pictureInPicture';
  }

  getCurrentTime(): number {
    return this.videoPlayer.getCurrentTime();
  }

  getFormattedCurrentTime(): string {
    const currentTime = this.getCurrentTime();
    return formatTime(currentTime, true);
  }

  onCurrentTimeChange(time: number): void {
    this.videoPlayer.setCurrentTime(time);
  }

  getDurationTime(): number {
    return this.videoPlayer.getDuration();
  }

  getFormattedDurationTime(): string {
    const contentDuration = this.getDurationTime();
    return formatTime(contentDuration, true);
  }

  getBufferEndTime(): number {
    return this.videoPlayer.getBufferEnd();
  }

  onVolumeChange(event: Event): void {
    if (this.videoPlayer.isMuted()) this.onToggleMute();

    const volume = parseFloat((event.target as HTMLInputElement).value);
    this.currentVolume = volume;
    this.videoPlayer.setVolume(volume);
  }

  getVolumeIconName(): string {
    if (this.videoPlayer.isMuted() || this.currentVolume == 0) return 'volume0';
    else if (this.currentVolume > 0.7) return 'volume1';
    else if (this.currentVolume > 0.4) return 'volume05';
    return 'volume025';
  }

  onToggleMute(): void {
    this.videoPlayer.toggleMute();
  }

  getVideoTitleLabel(): string {
    return this.titleName;
  }

  onSetSpeed(speed: number): void {
    this.videoPlayer.setPlaybackRate(speed);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const volumeStep = 0.1;
    const timeStep = 10;

    if (event.code === 'Space') {
      event.preventDefault();

      this.isSpaceHeld = true;
      this.isSpeedToggled = false;

      this.spaceHoldInterval = interval(100)
        .pipe(takeWhile(() => this.isSpaceHeld))
        .subscribe(() => {
          this.isSpeedToggled = true;
          this.onSetSpeed(this.playbackSpeed2x);
        });
    }

    if (event.code === 'KeyF') {
      event.preventDefault();
      this.onToggleFullscreen();
    }

    if (event.code === 'ArrowUp') {
      event.preventDefault();
      this.currentVolume += this.currentVolume + volumeStep > 1 ? 0 : volumeStep;
      this.videoPlayer.setVolume(this.currentVolume);
    }

    if (event.code === 'ArrowDown') {
      event.preventDefault();
      this.currentVolume -= this.currentVolume - volumeStep < 0 ? 0 : volumeStep;
      this.videoPlayer.setVolume(this.currentVolume);
    }

    if (event.code === 'ArrowLeft') {
      event.preventDefault();
      const currentTime = this.getCurrentTime();
      this.onCurrentTimeChange(currentTime - timeStep);
    }

    if (event.code === 'ArrowRight') {
      event.preventDefault();
      const currentTime = this.getCurrentTime();
      this.onCurrentTimeChange(currentTime + timeStep);
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.preventDefault();

      if (this.isSpaceHeld) {
        this.spaceHoldInterval?.unsubscribe();
        this.isSpaceHeld = false;
      }

      if (this.isSpeedToggled) {
        this.videoPlayer.setPlaybackRate(this.defaultPlaybackSpeed);
      } else {
        this.onTogglePlay();
      }
    }
  }

  @HostListener('document:mousemove')
  onMouseMove(): void {
    this.mouseMoveSubject.next();
  }

  onMouseUp(event: MouseEvent): void {
    if (event.button === 0) {
      this.onTogglePlay();
    }
  }
}
