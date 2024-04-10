import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import Hls from 'hls.js';

@Component({
  selector: 'app-media-viewer',
  standalone: true,
  imports: [],
  templateUrl: './media-viewer.component.html',
})
export class MediaViewerComponent implements OnDestroy {
  @ViewChild('videoControl') videoElement!: ElementRef<HTMLVideoElement>;

  hls!: Hls;
  constructor() {}

  // ngOnInit(): void {}
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngAfterViewInit(): void {
    this.setupPlayer();
  }
  ngOnDestroy(): void {
    if (this.hls) {
      this.hls.destroy();
    }
  }

  setupPlayer() {
    const video = this.videoElement.nativeElement;
    const src = 'http://127.0.0.1:8080/streams/myMovieOutputFolder1080p/output.m3u8'; // HLS source

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(src);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
    }
  }
}
