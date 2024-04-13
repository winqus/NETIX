import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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

  player!: Player;

  options = {
    fill: true,
    responsive: true,
    sources: [
      {
        // src: 'assets/meme.mp4',
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
    this.player.volume(this.volume);
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
    this.player.volume(this.volume);
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
    if (this.newTime != 0) {
      return this.newTime.toFixed(20) + '%';
    } else {
      return (this.player.bufferedPercent() * 100).toFixed(20) + '%';
    }
  }
  progress(): string {
    if (this.currentTime == undefined || this.duration == undefined) return '0%';
    return ((this.currentTime / this.duration) * 100).toFixed(20) + '%';
  }

  isDragging = false;
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.seek(event);
    if (this.duration != undefined && this.newTime >= 0 && this.newTime <= 100) {
      // console.log(this.newTime + ' ' + this.duration + ' ' + (this.newTime * this.duration) / 100);
      this.player.currentTime((this.newTime * this.duration) / 100);
    }
  }

  onMouseMove(event: MouseEvent): void {
    this.seek(event);
  }

  onMouseUp(event: MouseEvent): void {
    this.isDragging = false;
    this.seek(event);
    this.newTime = 0;
  }

  seek(event: MouseEvent): void {
    const timeline = (event.target as HTMLElement).closest('.timeline-container') as HTMLElement;
    const rect = timeline.getBoundingClientRect();
    this.newTime = ((event.clientX - rect.left) * 100) / rect.width;
    if (this.isDragging) {
      console.log(this.isDragging);
      if (this.duration != undefined && this.newTime >= 0 && this.newTime <= 100) {
        this.player.currentTime((this.newTime * this.duration) / 100);
      }
    }
  }
}
