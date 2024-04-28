//? TODO tooltips on buttons?

import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subscription, debounceTime, fromEvent, map, timer } from 'rxjs';

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
  @ViewChild('timeline', { static: false }) videoTimeline!: ElementRef<HTMLElement>;
  @ViewChild('thumbTooltip', { static: false }) thumbTooltip!: ElementRef<HTMLElement>;

  player!: Player;

  private options = {
    fill: true,
    responsive: true,
    autoplay: true,
    controls: false,
    sources: [
      {
        src: '/api/streams/meme/output.m3u8',
        type: 'application/vnd.apple.mpegurl',
      },
    ],
  };

  videoTitle = 'Star Wars';

  volume: number = 1.0;
  currentTime: number = 0;
  newTime: number = 0;
  duration: number = 0;

  private resizeSubscription: Subscription;
  isMobile$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isMobile: boolean = false;

  constructor() {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(
        debounceTime(300),
        map(() => this.checkScreenSize())
      )
      .subscribe((isMobile) => {
        this.isMobile$.next(isMobile);
        this.isMobile = isMobile;
      });
  }

  ngOnInit(): void {
    this.setupPlayer();

    this.isMobile = this.checkScreenSize();
    console.log(this.isMobile);
    if (this.isMobile) {
      this.setupActivityTracker();
    }
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }

    if (this.idleTimerSubscription) {
      this.idleTimerSubscription.unsubscribe();
    }
    this.resizeSubscription.unsubscribe();
  }

  setupPlayer() {
    const target = this.videoPlayerElement.nativeElement;

    this.player = videojs(target, this.options);
    this.player.usingNativeControls(false);
    this.changeVolume();

    this.player.on('timeupdate', () => {
      this.currentTime = this.player ? this.player.currentTime() || 0 : 0;
      this.duration = this.player ? this.player.duration() || 0 : 0;
    });
  }

  // * CONTROLS
  controlsVisible: boolean = true;
  private idleTimerSubscription!: Subscription;
  private idleThreshold = 3000;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key) {
      case ' ':
        event.preventDefault();
        this.togglePlay();
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

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.seek(event);

    if (this.isMobile) {
      return;
    }

    this.controlsVisible = true;
    if (this.idleTimerSubscription) {
      this.idleTimerSubscription.unsubscribe();
    }

    this.resetIdleTimer();
  }

  private setupActivityTracker() {
    this.resetIdleTimer();
  }

  private resetIdleTimer() {
    const idleTimer = timer(this.idleThreshold);
    this.idleTimerSubscription = idleTimer.subscribe(() => {
      if (!this.isPlaying()) {
        this.controlsVisible = false;
      }
    });
  }

  checkScreenSize(): boolean {
    // Example of a simple responsive check based on viewport width
    let hasTouchScreen = false;
    if ('maxTouchPoints' in navigator) {
      hasTouchScreen = navigator.maxTouchPoints > 0;
      this.isMobile = hasTouchScreen;
    }
    // if (window.innerWidth <= 768) {
    //   return true;
    // }

    console.log(hasTouchScreen);
    return hasTouchScreen;
  }

  // lastClickTime!: number;
  // onTouch(event: TouchEvent): void {
  //   console.log(event);
  // if (event.button != 0) {
  //   return;
  // }
  // // Prevent double click from triggering this twice
  // const currentTime = new Date().getTime();
  // if (currentTime - (this.lastClickTime || 0) < 300) {
  //   return;
  // }
  // this.lastClickTime = currentTime;
  // setTimeout(() => {
  //   if (currentTime === this.lastClickTime) {
  //     this.togglePlay();
  //   }
  // }, 300);
  // }

  // onDoubleClick(event: MouseEvent): void {
  //   if (event.button != 0) {
  //     return;
  //   }

  //   this.toggleFullscreen();
  // }

  // * PLAY/PAUSE
  togglePlay() {
    this.player.paused() ? this.player.play() : this.player.pause();
  }

  isPlaying(): boolean {
    return this.player ? this.player.paused() : false;
  }

  // * FASTFORWARD & FASTBACKWARD
  private fastTime: number = 10;

  fastForward() {
    if (this.currentTime + this.fastTime <= this.duration) {
      this.player.currentTime(this.currentTime + this.fastTime);
    } else {
      this.player.currentTime(this.duration);
    }
  }

  fastBackward() {
    if (this.currentTime - this.fastTime >= 0) {
      this.player.currentTime(this.currentTime - this.fastTime);
    } else {
      this.player.currentTime(0);
    }
  }

  // * VOLUME
  sliderVisible: boolean = false;

  toggleMute(): void {
    this.player.muted(!this.player.muted());
  }

  changeVolume(): void {
    const slider = document.querySelector('.slider') as HTMLInputElement;
    if (slider) {
      slider.style.setProperty('--thumb-position', `${this.volume * 100}%`);
    }

    this.player.volume(this.volume);
  }

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

  // * FULLSCREEN
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

  // * PICTURE IN PICTURE
  enablePictureInPicture() {
    !this.player.isInPictureInPicture() ? this.player.requestPictureInPicture() : this.player.exitPictureInPicture();
  }

  // * TIMELINE

  isDragging = false;
  isInTimeline = false;

  // thumb tool tip
  tooltipPosition: number = 0;
  currentTooltipTime: string = '';

  previewBufferedProgress(): string {
    const duration = this.duration ?? 0;
    const currentTime = this.currentTime ?? 0;

    if (this.isInTimeline) {
      return this.calculatePercentage(this.newTime, duration);
    } else {
      const passedPercent = currentTime / duration;
      return this.calculatePercentage(passedPercent + this.player.bufferedEnd(), duration);
    }
  }

  mediaProgress(): string {
    if (this.isDragging) {
      this.currentTime = this.newTime;
    }

    return this.calculatePercentage(this.currentTime, this.duration);
  }

  // helper function
  private calculatePercentage(time: number, duration: number): string {
    if (duration === 0) return '0%';

    const percentage = (time / duration) * 100;
    return `${percentage.toFixed(20)}%`;
  }

  // * TIMELINE FOR DESKTOP
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.seek(event);
    this.currentTime = this.newTime;
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

  seek(event: any): void {
    // if (this.isMobile) {
    //   return;
    // }

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
  // * TIMELINE FOR MOBILE
  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    this.isDragging = true;
    this.isInTimeline = true;
    if (event.touches.length > 0) {
      const touch = event.touches[0];

      this.seek(touch);
      // this.currentTime = this.newTime;

      // console.log(`Touch coordinates: clientX=${touch.clientX}, clientY=${touch.clientY}`);
      // console.log(`Page coordinates: pageX=${touch.pageX}, pageY=${touch.pageY}`);
      // console.log(`Screen coordinates: screenX=${touch.screenX}, screenY=${touch.screenY}`);
    }
  }

  onTouchMove(event: TouchEvent) {
    this.isDragging = true;
    this.isInTimeline = true;
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.seek(touch);
    }
    // this.isDragging = false;
    // this.isInTimeline = false;
  }

  onTouchEnd(event: TouchEvent) {
    this.isDragging = false;
    this.isInTimeline = false;
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.seek(touch);
    }

    console.log(event);
    this.player.currentTime(this.currentTime);
  }

  // * HELPER FUNCTIONS
  // time converter time -> 00:00:00
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
}
