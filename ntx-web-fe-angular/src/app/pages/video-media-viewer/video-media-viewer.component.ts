import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription, debounceTime, filter, firstValueFrom, fromEvent, map, timer } from 'rxjs';
import { FormsModule } from '@angular/forms';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from '@ntx-shared/services/layout.service';
import { SvgIconsComponent } from '@ntx/app/shared/ui/svg-icons.component';
import { formatTime } from '@ntx-shared/services/utils/utils';
import { MovieDTO } from '@ntx-shared/models/movie.dto';

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
  mediaData?: MovieDTO;
  streamID: string | null = null;

  private readonly options = {
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
    private readonly router: Router,
    private readonly activeRoute: ActivatedRoute,
    private readonly layoutService: LayoutService
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
    await this.loadVideoStreamID();
    this.setupPlayer();

    this.isMobile = this.checkScreenSize();
    this.setupActivityTracker();
  }

  private async loadVideoStreamID(): Promise<void> {
    const params = await firstValueFrom(this.activeRoute.paramMap);
    this.streamID = params!.get('uuid');

    if (this.streamID) {
      this.mediaData = history.state.data as MovieDTO;
      this.videoTitle = this.mediaData?.name || 'No title available';

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
    if (event.key == ' ') {
      event.preventDefault();
      this.togglePlay();
    }
  }

  lastClickTime!: number;
  onClick(event: MouseEvent): void {
    if (event.button != 0) {
      return;
    }

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
    this.updateTimelinePosition(event);

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
    this.idleTimerSubscription?.unsubscribe();

    this.idleTimerSubscription = timer(this.idleThreshold)
      .pipe(filter(() => !this.isPlaying() && !this.isMobile))
      .subscribe(() => {
        this.controlsVisible = false;
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

    this.layoutService.setIsMobile(hasTouchScreen);
    return hasTouchScreen;
  }

  lastTouchTime!: number;
  onTouch(event: TouchEvent): void {
    this.updateTimelinePosition(event as TouchEvent);

    const currentTime = Date.now();
    if (this.isDoubleTap(currentTime)) {
      this.toggleFullscreen();
      this.resetLastTouchTimeout();
    } else {
      this.handleSingleTouch(currentTime);
    }
  }

  private isDoubleTap(currentTime: number): boolean {
    return currentTime - (this.lastTouchTime || 0) < 300;
  }

  private handleSingleTouch(currentTime: number): void {
    this.lastTouchTime = currentTime;
    this.setSingleTouchTimeout(currentTime);
  }

  private setSingleTouchTimeout(time: number) {
    setTimeout(() => {
      if (time === this.lastTouchTime) {
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
    return this.player?.muted() || false;
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
    if (this.isDragging || !this.duration) {
      return '0%';
    }

    const duration = this.duration;
    const progressTime = this.isInTimeline ? this.newTime : this.player?.bufferedEnd() ?? 0;

    return this.calculatePercentage(progressTime, duration);
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
    this.updateTimelinePosition(event);
    this.currentTime = this.newTime;
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isDragging = false;
    this.updateTimelinePosition(event);
    this.player.currentTime(this.currentTime);
  }

  onMouseEnter(): void {
    this.isInTimeline = true;
  }

  onMouseLeave(event: MouseEvent): void {
    this.isInTimeline = false;
    this.updateTimelinePosition(event);
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

  updateTimelinePosition(event: any): void {
    const clientX = event.clientX;

    const rect = this.videoTimeline.nativeElement.getBoundingClientRect();
    const toolTipRect = this.thumbTooltip.nativeElement.getBoundingClientRect();

    const newProgress = ((clientX - rect.left) * 100) / rect.width;
    const clampedProgress = Math.max(0, Math.min(100, newProgress));

    this.newTime = (clampedProgress * this.duration) / 100;
    this.currentTooltipTime = formatTime(this.newTime, true);

    this.tooltipPosition = this.calculateTooltipPosition(clientX, rect, toolTipRect);
  }

  private calculateTooltipPosition(clientX: number, rect: DOMRect, toolTipRect: DOMRect): number {
    const halfTooltipWidth = toolTipRect.width / 2;
    const minPosition = rect.left;
    const maxPosition = rect.left + rect.width - toolTipRect.width;

    let tooltipPosition = clientX - halfTooltipWidth;
    tooltipPosition = Math.max(minPosition, Math.min(maxPosition, tooltipPosition));

    return tooltipPosition;
  }

  // * TIMELINE FOR MOBILE
  onTouchStart(event: TouchEvent) {
    this.isDragging = true;
    this.isInTimeline = true;
    if (event.touches.length > 0) {
      const touch = event.touches[0];

      this.updateTimelinePosition(touch);
    }
  }

  onTouchMove(event: TouchEvent) {
    this.isDragging = true;
    this.isInTimeline = true;
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.updateTimelinePosition(touch);
    }
  }

  onTouchEnd(event: TouchEvent) {
    this.isDragging = false;
    this.isInTimeline = false;
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.updateTimelinePosition(touch);
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
