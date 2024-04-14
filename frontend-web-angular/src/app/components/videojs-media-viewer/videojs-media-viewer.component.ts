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
  @ViewChild('videoPlayer', { static: true }) videoPlayerElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('timeline', { static: true }) videoTimeline!: ElementRef<HTMLElement>;

  player!: Player;

  options = {
    fill: true,
    responsive: true,
    autoplay: true,
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
    this.changeVolume();
  }
  // Controls

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
  toggleFullscreen(): void {
    if (!this.player.isFullscreen()) {
      this.player.requestFullscreen();
    } else {
      this.player.exitFullscreen();
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
    // if (this.isDragging) {
    // if (this.mouseEventLeavesWindow(event)) {
    // this.isDragging = false;
    // }
    this.seek(event);
    // }
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
    // console.log(this.newTime + ' ' + this.currentTime!);
    // this.newTime = 0;
  }
  @HostListener('document:mouseout', ['$event'])
  onMouseOut(event: MouseEvent): void {
    if (this.mouseEventLeavesWindow(event)) {
      this.onMouseUp(event);
    }
  }
  private mouseEventLeavesWindow(event: MouseEvent): boolean {
    // Check if the mouse has actually left the window
    return event.clientX <= 0 || event.clientX >= window.innerWidth || event.clientY <= 0 || event.clientY >= window.innerHeight;
  }
  seek(event: MouseEvent): void {
    // const timeline = (event.target as HTMLElement).closest('.timeline-container') as HTMLElement;
    // const rect = timeline.getBoundingClientRect();
    const rect = this.videoTimeline.nativeElement.getBoundingClientRect();

    const newProgress = ((event.clientX - rect.left) * 100) / rect.width;
    if (newProgress >= 0 && newProgress <= 100 && this.duration != undefined) {
      this.newTime = (newProgress * this.duration) / 100;
      this.currentTooltipTime = this.convertToTime(this.newTime);
      this.tooltipPosition = event.clientX - 64;
      // console.log(newProgress + ' ' + this.currentTime! + ' ' + this.newTime + ' ' + this.duration);
      // this.player.currentTime((this.newTime * this.duration) / 100);
    }
  }
  // thumb tool tip
  tooltipPosition: number = 0;
  currentTooltipTime: string = '';

  // updateTooltip(event: MouseEvent): void {
  //   const timelineRect = this.videoTimeline.nativeElement.getBoundingClientRect();
  //   const position = event.clientX - timelineRect.left; // Position within the timeline
  //   this.tooltipPosition = position;
  //   const time = this.calculateTimeFromPosition(position);
  //   this.currentTooltipTime = this.formatTime(time);
  // }

  // calculateTimeFromPosition(position: number): number {
  //   // Assuming the max position is the width of the timeline
  //   const timelineWidth = this.videoTimeline.nativeElement.offsetWidth;
  //   const time = (position / timelineWidth) * this.duration!; // Calculate time based on position
  //   return time;
  // }

  // formatTime(seconds: number): string {
  //   // Format seconds into a time string (HH:MM:SS or MM:SS)
  //   const date = new Date(0);
  //   date.setSeconds(seconds); // Set the seconds
  //   const timeString = date.toISOString().substr(11, 8);
  //   return timeString.startsWith('00:') ? timeString.substr(3) : timeString;
  // }
}
