import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';

@Injectable({ providedIn: 'root' })
export class VideoPlayerService {
  private player!: Player;

  private readonly playerReadySubject = new BehaviorSubject<boolean>(false);
  playerReady$ = this.playerReadySubject.asObservable();

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
        type: '',
      },
    ],
  };

  initializePlayer(videoElement: HTMLVideoElement, source: string, type: string): void {
    this.options.sources[0].src = source;
    this.options.sources[0].type = type;

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

    this.player.ready(() => {
      this.playerReadySubject.next(true);
    });
  }

  togglePlay(): void {
    if (!this.player) return;
    this.player.paused() ? this.player.play() : this.player.pause();
  }

  isPaused(): boolean {
    if (!this.player) return true;
    return this.player.paused();
  }

  enablePictureInPicture() {
    if (!this.player) return;
    this.player.isInPictureInPicture() ? this.player.exitPictureInPicture() : this.player.requestPictureInPicture();
  }

  getCurrentTime(): number {
    return this.currentTimeSubject.getValue();
  }

  getDuration(): number {
    return this.durationSubject.getValue();
  }

  setVolume(volume: number): void {
    if (!this.player) return;
    this.player.volume(volume);
    this.volumeSubject.next(volume);
  }

  getVolume(): number {
    return this.volumeSubject.getValue();
  }

  toggleMute(): void {
    if (!this.player) return;
    const isMuted = this.player.muted();
    this.player.muted(!isMuted);
  }

  isMuted(): boolean {
    if (!this.player) return true;
    return this.player.muted() ?? true;
  }

  getBufferEnd(): number {
    if (!this.player) return 0;
    return this.player.bufferedEnd();
  }

  setCurrentTime(time: number): void {
    if (!this.player) return;
    this.player.currentTime(time);
  }

  getPlaybackRate(): number {
    if (!this.player) return 1.0;
    return this.player.playbackRate() ?? 0;
  }

  setPlaybackRate(rate: number): void {
    if (!this.player) return;
    this.player.playbackRate(rate);
  }
}
