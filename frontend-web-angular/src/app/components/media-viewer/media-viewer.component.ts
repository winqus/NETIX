import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import Hls from 'hls.js';
import Plyr from 'plyr';

@Component({
  selector: 'app-media-viewer',
  standalone: true,
  imports: [],
  templateUrl: './media-viewer.component.html',
  styleUrls: ['./media-viewer.component.scss'],
})
export class MediaViewerComponent implements OnDestroy {
  @ViewChild('videoControl') videoElement!: ElementRef<HTMLVideoElement>;
  plyr!: Plyr;

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
    // const src = 'http://127.0.0.1:8080/streams/myMovieOutputFolder1080p/output.m3u8'; // HLS source
    // const src = 'http://127.0.0.1:8080/streams/soloOutput2SameRes/output.m3u8'; // HLS source
    // const src = '/api/streams/soloOutput2SameRes/output.m3u8'; // HLS source
    // const src = '/api/streams/myMovieOutputFolder/output.m3u8'; // HLS source
    const src = '/api/streams/meme/output.m3u8'; // HLS source

    // http://127.0.0.1:8080/api/streams/myMovieOutputFolder1080p/output.m3u8
    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(src);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.plyr = new Plyr(video, {
          // controls: ['play', 'progress', 'mute', 'volume', 'fullscreen'],
          // settings: ['captions', 'quality', 'speed'],
        });
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        this.plyr = new Plyr(video, {
          // controls: ['play', 'progress', 'mute', 'volume', 'fullscreen'],
          // settings: ['captions', 'quality', 'speed'],
        });
        video.play();
      });
    }
  }
}
