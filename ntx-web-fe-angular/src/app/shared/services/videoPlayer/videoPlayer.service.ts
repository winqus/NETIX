import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

@Injectable({ providedIn: 'root' })
export class VideoPlayerService {
  private player!: Player;

  private readonly currentTimeSubject = new BehaviorSubject<number>(0);
  currentTime$ = this.currentTimeSubject.asObservable();

  private readonly durationSubject = new BehaviorSubject<number>(0);
  duration$ = this.durationSubject.asObservable();

  private readonly volumeSubject = new BehaviorSubject<number>(1.0);
  volume$ = this.volumeSubject.asObservable();

  private readonly options = {
    fill: true,
    responsive: true,
    autoplay: true,
    controls: false,
    sources: [
      {
        src: '',
        type: 'video/mp4',
      },
    ],
  };

  initializePlayer(videoElement: HTMLVideoElement, source: string): void {
    this.options.sources[0].src = source;

    this.player = videojs(videoElement, this.options);

    this.player.on('loadedmetadata', () => {
      const duration = this.player.duration() ?? 0;
      this.durationSubject.next(duration);
    });

    this.player.on('timeupdate', () => {
      const currentTime = this.player.currentTime() ?? 0;
      this.currentTimeSubject.next(currentTime);
    });

    this.player.on('volumechange', () => {
      const volume = this.player.volume() ?? 0;
      this.volumeSubject.next(volume);
    });
  }

  togglePlay(): void {
    this.player.paused() ? this.player.play() : this.player.pause();
  }

  isPaused(): boolean {
    return this.player.paused();
  }

  enablePictureInPicture() {
    this.player.isInPictureInPicture() ? this.player.exitPictureInPicture() : this.player.requestPictureInPicture();
  }

  getCurrentTime(): number {
    return this.currentTimeSubject.getValue();
  }

  getDuration(): number {
    return this.durationSubject.getValue();
  }

  setVolume(volume: number): void {
    this.player.volume(volume);
    this.volumeSubject.next(volume);
  }

  getVolume(): number {
    return this.volumeSubject.getValue();
  }

  toggleMute(): void {
    const isMuted = this.player.muted();
    this.player.muted(!isMuted);
  }

  isMuted(): boolean {
    return this.player.muted() ?? true;
  }

  getBufferEnd(): number {
    return this.player.bufferedEnd();
  }

  setCurrentTime(time: number): void {
    this.player.currentTime(time);
  }

  // Add other methods like seek, setVolume, etc.
}
