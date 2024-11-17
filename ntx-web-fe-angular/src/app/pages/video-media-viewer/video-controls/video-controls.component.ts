import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons.component';
import { formatTime } from '@ntx-shared/services/utils/utils';
import { fromEvent, Subscription } from 'rxjs';
import { VideoPlayerService } from '@ntx/app/shared/services/videoPlayer/videoPlayer.service';
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

  private fullscreenChangeSubscription!: Subscription;
  currentVolume: number = 1.0;
  isFullscreen: boolean = false;
  isVolumeSliderVisible: boolean = true;

  ngAfterViewInit(): void {
    this.fullscreenChangeSubscription = fromEvent(document, 'fullscreenchange').subscribe(() => {
      this.isFullscreen = !!document.fullscreenElement;
    });

    this.currentVolume = this.videoPlayer.getVolume();
  }

  ngOnDestroy(): void {
    this.fullscreenChangeSubscription.unsubscribe();
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

  onCurrentTimeChange(time: number): void {
    this.videoPlayer.setCurrentTime(time);
  }
}
