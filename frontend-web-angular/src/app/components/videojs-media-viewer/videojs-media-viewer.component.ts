import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-videojs-media-viewer',
  standalone: true,
  imports: [],
  templateUrl: './videojs-media-viewer.component.html',
  styleUrls: ['./videojs-media-viewer.component.scss'],
})
export class VideojsMediaViewerComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', { static: true }) videoPlayerElement!: ElementRef<HTMLVideoElement>;

  player!: Player;

  /* More about different options at https://videojs.com/guides/options/ */
  options = {
    fluid: true,
    aspectRatio: '16:9',
    autoplay: true,
    sources: [
      {
        src: '/api/streams/soloOutput2SameRes/output.m3u8',
        // src: '/api/streams/myMovieOutputFolder/output.m3u8',
        // src: '/api/streams/meme/output.m3u8',
        type: 'application/vnd.apple.mpegurl',
      },
    ],
  };

  ngOnInit(): void {
    this.setupPlayer();
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.dispose();
    }
  }

  setupPlayer() {
    const target = this.videoPlayerElement.nativeElement;

    this.player = videojs(target, this.options, () => {
      if (environment.development) {
        console.log('Player is ready', this);
      }
    });
  }
}
