//? TODO tooltips on buttons?

import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { FormsModule } from '@angular/forms';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-video-media-viewer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './video-media-viewer.component.html',
  styleUrls: ['./video-media-viewer.component.scss'],
})
export class VideoMediaViewerComponent implements OnInit, OnDestroy {
  @ViewChild('fullscreenContainer', { static: true }) fullscreenContainer!: ElementRef<HTMLElement>;
  @ViewChild('videoPlayer', { static: true }) videoPlayerElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('timeline', { static: true }) videoTimeline!: ElementRef<HTMLElement>;
  @ViewChild('thumbTooltip', { static: true }) thumbTooltip!: ElementRef<HTMLElement>;

  player!: Player;

  options = {
    fill: true,
    responsive: true,
    autoplay: true,
    controls: false,
    sources: [
      {
        // src: 'assets/meme4.mp4',
        // type: 'video/mp4',

        src: '/api/streams/meme/output.m3u8',
        // src: '/api/streams/meme2/output.m3u8',
        // src: '/api/streams/meme3/output.m3u8',
        type: 'application/vnd.apple.mpegurl',
      },
    ],
  };

  videoTitle = 'Star Wars';

  volume: number = 1.0; // Default volume
  currentTime: number | undefined = 0;
  newTime: number = 0;
  duration: number | undefined = 0;

  ngOnInit(): void {
    this.setupPlayer();
    this.setupActivityTracker();

    this.player.on('timeupdate', () => {
      this.currentTime = this.player.currentTime();
      this.duration = this.player.duration();
    });
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }

    if (this.idleTimerSubscription) {
      this.idleTimerSubscription.unsubscribe();
    }
  }

  setupPlayer() {
    const target = this.videoPlayerElement.nativeElement;

    this.player = videojs(target, this.options);
    this.player.usingNativeControls(false);
    this.changeVolume();

    this.videoPlayerElement.nativeElement.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });
  }

  // Controls
  controlsVisible: boolean = true;
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'h':
        // this.toggleControls();
        this.controlsVisible = !this.controlsVisible;
        break;
    }
  }
  lastClickTime!: number;
  onClick(event: MouseEvent): void {
    if (event.button != 0) {
      return;
    }
    // Prevent double click from triggering this twice
    const currentTime = new Date().getTime();
    if (currentTime - (this.lastClickTime || 0) < 300) {
      return;
    }

    this.lastClickTime = currentTime;

    setTimeout(() => {
      if (currentTime === this.lastClickTime) {
        this.togglePlay();
      }
    }, 300);
  }
  onDoubleClick(event: MouseEvent): void {
    if (event.button != 0) {
      return;
    }

    this.toggleFullscreen();
  }

  // time
  convertToTime(timeInSeconds: number | undefined): string {
    if (timeInSeconds == undefined) return '00:00:00';
    let seconds = Math.floor(timeInSeconds);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    // Building the time format by checking if hours or minutes are zero
    if (hours > 0) {
      return `${hours}:${this.padZero(minutes)}:${this.padZero(seconds)}`;
    } else if (minutes > 0) {
      return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
    } else {
      return `00:${this.padZero(seconds)}`;
    }
  }

  // Helper function to pad numbers with zero if less than 10
  private padZero(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  // play/pause
  togglePlay() {
    this.player.paused() ? this.player.play() : this.player.pause();
  }
  isPlaying(): boolean {
    return !this.player.paused();
  }
  // forward/backward
  goForward() {
    if (this.duration != undefined && this.currentTime != undefined && this.currentTime + 10 <= this.duration) {
      this.currentTime += 10;
      this.player.currentTime(this.currentTime);
    } else {
      this.player.currentTime(this.duration);
    }
  }
  goBackward() {
    if (this.duration != undefined && this.currentTime != undefined && this.currentTime - 10 >= 0) {
      this.currentTime -= 10;
      this.player.currentTime(this.currentTime);
    } else {
      this.player.currentTime(0);
    }
  }
  // volume
  toggleMute(): void {
    this.player.muted(!this.player.muted());
  }

  changeVolume(): void {
    const slider = document.querySelector('.slider') as HTMLInputElement;
    slider.style.setProperty('--thumb-position', `${this.volume * 100}%`);
    this.player.volume(this.volume);
  }

  sliderVisible: boolean = false;

  showSlider(): void {
    this.sliderVisible = true;
  }

  hideSlider(event: MouseEvent): void {
    if (!event.relatedTarget || !(event.relatedTarget as Element).classList.contains('slider')) {
      this.sliderVisible = false;
    }
  }

  keepSliderVisible(): void {
    this.sliderVisible = true;
  }
  // Fullscreen
  isInFullscreen: boolean = false;
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.fullscreenContainer.nativeElement.requestFullscreen();
      this.isInFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isInFullscreen = false;
    }
  }
  // Picture In Picture
  enablePictureInPicture() {
    !this.player.isInPictureInPicture() ? this.player.requestPictureInPicture() : this.player.exitPictureInPicture();
  }

  // timeline
  previewProgress(): string {
    const duration = this.duration ?? 0;
    const currentTime = this.currentTime ?? 0;

    if (this.newTime != 0 && this.isInTimeline) {
      return this.calculatePercentage(this.newTime, duration);
    } else {
      const passedPercent = currentTime / duration;
      return this.calculatePercentage(passedPercent + this.player.bufferedEnd(), duration);
    }
  }

  progress(): string {
    if (this.duration === undefined || this.currentTime === undefined) {
      return '0%';
    }

    if (this.isDragging) {
      this.currentTime = this.newTime;
    }

    return this.calculatePercentage(this.currentTime, this.duration);
  }

  private calculatePercentage(time: number, duration: number): string {
    if (duration === 0) return '0%';

    const percentage = (time / duration) * 100;
    return `${percentage.toFixed(20)}%`;
  }

  isDragging = false;
  isInTimeline = false;
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.seek(event);
    this.currentTime = this.newTime;
  }
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.seek(event);
    this.controlsVisible = true;

    if (this.idleTimerSubscription) {
      this.idleTimerSubscription.unsubscribe();
    }

    this.resetIdleTimer();
  }
  private idleTimerSubscription!: Subscription;
  private idleThreshold = 3000;

  private setupActivityTracker() {
    this.resetIdleTimer();
  }

  private resetIdleTimer() {
    const idleTimer = timer(this.idleThreshold);
    this.idleTimerSubscription = idleTimer.subscribe(() => {
      if (this.isPlaying()) {
        this.controlsVisible = false;
      }
    });
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isDragging = false;
    this.seek(event);
    this.player.currentTime(this.currentTime);
  }
  onMouseEnter(): void {
    this.isInTimeline = true;
  }
  onMouseLeave(event: MouseEvent): void {
    this.isInTimeline = false;
    this.seek(event);
  }
  @HostListener('document:mouseout', ['$event'])
  onMouseOut(event: MouseEvent): void {
    if (this.mouseEventLeavesWindow(event)) {
      this.onMouseUp(event);
    }
  }
  private mouseEventLeavesWindow(event: MouseEvent): boolean {
    return event.clientX <= 0 || event.clientX >= window.innerWidth || event.clientY <= 0 || event.clientY >= window.innerHeight;
  }
  seek(event: MouseEvent): void {
    const rect = this.videoTimeline.nativeElement.getBoundingClientRect();
    const toolTipRect = this.thumbTooltip.nativeElement.getBoundingClientRect();

    const newProgress = ((event.clientX - rect.left) * 100) / rect.width;
    if (newProgress >= 0 && newProgress <= 100 && this.duration != undefined) {
      this.newTime = (newProgress * this.duration) / 100;
      this.currentTooltipTime = this.convertToTime(this.newTime);

      if (event.x <= toolTipRect.width / 2 + rect.left) {
        this.tooltipPosition = event.clientX - event.x + rect.left;
      } else if (event.x >= rect.width - toolTipRect.width / 2 + rect.left) {
        this.tooltipPosition = rect.width - toolTipRect.width + rect.left;
      } else {
        this.tooltipPosition = event.clientX - toolTipRect.width / 2;
      }
    }
  }
  // thumb tool tip
  tooltipPosition: number = 0;
  currentTooltipTime: string = '';
}
