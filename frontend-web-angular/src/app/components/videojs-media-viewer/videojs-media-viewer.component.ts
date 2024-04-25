//  TODO make volume slider animation: growing from left to right
//  TODO buffer
//  TODO when mouse idle the controls should vanish
//  TODO can add controls with right click
//? TODO tooltips on buttons?

import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-videojs-media-viewer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './videojs-media-viewer.component.html',
  styleUrls: ['./videojs-media-viewer.component.scss'],
})
export class VideojsMediaViewerComponent implements OnInit, OnDestroy {
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

    this.player.on('timeupdate', () => {
      this.currentTime = this.player.currentTime();
      this.duration = this.player.duration();
    });

    this.player.on('progress', () => {
      // Update buffered range here if needed
    });
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
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
  onClick(): void {
    console.log(this.lastClickTime);
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
  onDoubleClick(): void {
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
    if (this.player.paused()) {
      this.player.play();
    } else {
      this.player.pause();
    }
  }
  isPlaying(): boolean {
    if (this.player.paused()) {
      return false;
    } else {
      return true;
    }
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

  // fullscreen
  // toggleFullscreen(): void {
  //   if (!this.player.isFullscreen()) {
  //     this.player.requestFullscreen();
  //   } else {
  //     this.player.exitFullscreen();
  //   }
  // }
  isInFullscreen: boolean = false;
  toggleFullscreen() {
    const elem = this.fullscreenContainer.nativeElement;

    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
        this.isInFullscreen = true;
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        this.isInFullscreen = false;
      }
    }
  }
  // Picture In Picture
  enablePictureInPicture() {
    if (!this.player.isInPictureInPicture()) {
      this.player.requestPictureInPicture();
    } else {
      this.player.exitPictureInPicture();
    }
  }

  // timeline
  previewProgress(): string {
    if (this.newTime != 0 && this.duration != undefined && this.isInTimeline) {
      return ((this.newTime / this.duration) * 100).toFixed(20) + '%';
    } else {
      return (this.player.bufferedPercent() * 100).toFixed(20) + '%';
    }
  }
  progress(): string {
    if (this.currentTime == undefined || this.duration == undefined) return '0%';
    if (this.isDragging) {
      this.currentTime = this.newTime;
    }
    return ((this.currentTime / this.duration) * 100).toFixed(20) + '%';
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

  isMobile(): boolean {
    // Regex pattern to check if it's a Mobile Device
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(navigator.userAgent);
  }
}
