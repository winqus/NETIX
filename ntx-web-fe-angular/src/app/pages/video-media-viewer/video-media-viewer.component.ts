import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription, debounceTime, firstValueFrom, fromEvent, map, timer } from 'rxjs';
import { FormsModule } from '@angular/forms';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from '@ntx-shared/services/layout.service';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';
import { MediaItem } from '@ntx-shared/models/mediaItem';
import { formatTime } from '@ntx-shared/services/utils/utils';

@Component({
  selector: 'app-video-media-viewer',
  standalone: true,
  imports: [FormsModule, SvgIconsComponent],
  templateUrl: './video-media-viewer.component.html',
  styleUrls: ['./video-media-viewer.component.scss'],
})
export class VideoMediaViewerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fullscreenContainer', { static: true }) fullscreenContainer!: ElementRef<HTMLElement>;
  @ViewChild('videoPlayer', { static: true }) videoPlayerElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('timeline', { static: false }) videoTimeline!: ElementRef<HTMLElement>;
  @ViewChild('thumbTooltip', { static: false }) thumbTooltip!: ElementRef<HTMLElement>;

  player!: Player;

  mediaData?: MediaItem;
  streamID: string | null = null;

  private options = {
    fill: true,
    responsive: true,
    autoplay: true,
    controls: false,
    sources: [
      {
        src: '',
        type: 'application/vnd.apple.mpegurl',
      },
    ],
  };

  videoTitle = 'No title';

  volume: number = 1.0;
  currentTime: number = 0;
  newTime: number = 0;
  duration: number = 0;
  previewPosition: string = '0%';
  progressPosition: string = '0%';

  private resizeSubscription: Subscription;
  isMobile$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isMobile: boolean = false;

  constructor(
    private router: Router,

    private activeRoute: ActivatedRoute,
    private layoutService: LayoutService
  ) {
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

  async ngOnInit(): Promise<void> {
    await this.getStreamID();
    this.setupPlayer();

    this.isMobile = this.checkScreenSize();
    this.setupActivityTracker();
  }

  private async getStreamID(): Promise<void> {
    const params = await firstValueFrom(this.activeRoute.paramMap);
    this.streamID = params!.get('uuid');

    if (this.streamID) {
      this.mediaData = history.state.data as MediaItem;
      this.videoTitle = this.mediaData?.title || 'No title available';

      console.log('streamID', this.streamID);

      this.options.sources[0].src = `/api/v1/stream/${this.streamID}/`;
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

  ngAfterViewInit() {
    setTimeout(() => {
      this.changeVolume();
    }, 100);
  }

  setupPlayer() {
    const target = this.videoPlayerElement.nativeElement;

    this.player = videojs(target, this.options);

    this.player.on('timeupdate', () => {
      this.currentTime = this.player ? this.player.currentTime() || 0 : 0;
      this.duration = this.player ? this.player.duration() || 0 : 0;
      this.updateProgressStyles();
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
      if (!this.isPlaying() && !this.isMobile) {
        this.controlsVisible = false;
      }
    });
  }

  goBack() {
    this.layoutService.setIsMobile(false);
    this.router.navigate(['/']);
  }

  checkScreenSize(): boolean {
    let hasTouchScreen = false;
    if ('maxTouchPoints' in navigator) {
      hasTouchScreen = navigator.maxTouchPoints > 0;
    }
    // if (window.innerWidth <= 768) {
    //   return true;
    // }

    // console.log(hasTouchScreen);
    this.layoutService.setIsMobile(hasTouchScreen);
    return hasTouchScreen;
  }

  lastTouchTime!: number;
  onTouch(event: TouchEvent) {
    this.seek(event);
    const currentTime = new Date().getTime();
    if (currentTime - (this.lastTouchTime || 0) < 300) {
      this.toggleFullscreen();
      this.resetLastTouchTimeout();
    } else {
      // It's a single touch, potentially
      this.lastTouchTime = currentTime;
      this.setSingleTouchTimeout(currentTime);
    }
  }

  private setSingleTouchTimeout(time: number) {
    setTimeout(() => {
      if (time === this.lastTouchTime) {
        // No subsequent touch has occurred
        this.controlsVisible = !this.controlsVisible;
      }
    }, 300);
  }

  private resetLastTouchTimeout() {
    this.lastTouchTime = 0;
  }

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

  isMuted(): boolean {
    if (this.player) {
      return this.player.muted() || false;
    }

    return false;
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

  updateProgressStyles(): void {
    this.previewPosition = this.previewBufferedProgress();
    this.progressPosition = this.mediaProgress();
  }

  previewBufferedProgress(): string {
    if (this.isDragging) {
      return '0%';
    }

    const duration = this.duration ?? 0;
    const currentTime = this.currentTime ?? 0;

    if (this.isInTimeline) {
      return this.calculatePercentage(this.newTime, duration);
    } else {
      const passedPercent = currentTime / duration;
      let bufferedEnd = 0;
      if (this.player != undefined) {
        bufferedEnd = this.player.bufferedEnd();
      }
      return this.calculatePercentage(passedPercent + bufferedEnd, duration);
    }
  }

  mediaProgress(): string {
    if (this.isDragging && this.currentTime != this.newTime) {
      this.currentTime = this.newTime;
    }

    return this.calculatePercentage(this.currentTime, this.duration);
  }

  // helper function
  private calculatePercentage(time: number, duration: number): string {
    if (duration === 0) return '0%';

    const percentage = (time / duration) * 100;
    return `${percentage.toFixed(3)}%`;
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
    const clientX = event.clientX;

    const rect = this.videoTimeline.nativeElement.getBoundingClientRect();
    const toolTipRect = this.thumbTooltip.nativeElement.getBoundingClientRect();

    const newProgress = ((clientX - rect.left) * 100) / rect.width;
    if (newProgress >= 0 && newProgress <= 100 && this.duration != undefined) {
      this.newTime = (newProgress * this.duration) / 100;
      this.currentTooltipTime = formatTime(this.newTime, true);

      if (clientX <= toolTipRect.width / 2 + rect.left) {
        this.tooltipPosition = rect.left;
      } else if (clientX >= rect.width - toolTipRect.width / 2 + rect.left) {
        this.tooltipPosition = rect.width - toolTipRect.width + rect.left;
      } else {
        this.tooltipPosition = clientX - toolTipRect.width / 2;
      }
    }
  }
  // * TIMELINE FOR MOBILE
  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.isInTimeline = true;
    if (event.touches.length > 0) {
      const touch = event.touches[0];

      this.seek(touch);
    }
  }

  onTouchMove(event: TouchEvent) {
    this.isDragging = true;
    this.isInTimeline = true;
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.seek(touch);
    }
  }

  onTouchEnd(event: TouchEvent) {
    this.isDragging = false;
    this.isInTimeline = false;
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.seek(touch);
    }
    this.player.currentTime(this.currentTime);
  }

  // * HELPER FUNCTIONS
  getCurrentTime(): string {
    if (this.player) {
      return formatTime(this.player.currentTime(), true);
    }

    return '00:00';
  }

  getDurationTime(): string {
    if (this.player) {
      return formatTime(this.player.duration(), true);
    }

    return '00:00';
  }
}
