import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import Hls from 'hls.js';

@Component({
  selector: 'app-videojs-media-viewer',
  standalone: true,
  imports: [],
  templateUrl: './videojs-media-viewer.component.html',
  styleUrls: ['./videojs-media-viewer.component.scss'], // Note the correction here from `styleUrl` to `styleUrls`
})
export class VideojsMediaViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer', { static: true }) videoPlayer!: ElementRef<HTMLVideoElement>;

  player!: Player;
  hls!: Hls;

  constructor() {}

  ngAfterViewInit(): void {
    this.setupPlayer();
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
    if (this.hls) {
      this.hls.destroy();
    }
  }

  setupPlayer() {
    const video = this.videoPlayer.nativeElement;
    // const src = 'http://127.0.0.1:8080/streams/myMovieOutputFolder1080p/output.m3u8'; // HLS source
    // const src = 'http://127.0.0.1:8080/streams/soloOutput2SameRes/output.m3u8'; // HLS source
    // const src = '/api/streams/soloOutput2SameRes/output.m3u8'; // HLS source
    // const src = '/api/streams/myMovieOutputFolder/output.m3u8'; // HLS source
    const src = '/api/streams/meme/output.m3u8'; // HLS source

    this.player = videojs(this.videoPlayer.nativeElement, {
      // Video.js options here
      fluid: true,
      responsive: true,
      playbackRates: [0.5, 1, 1.5, 2],
      sources: [{ src, type: 'application/x-mpegURL' }],
    });

    // http://127.0.0.1:8080/api/streams/myMovieOutputFolder1080p/output.m3u8
    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(src);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.player.tech_.setSrc(src);
        video.play();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        this.player.tech_.setSrc(src);
        video.play();
      });
    }
  }
}
