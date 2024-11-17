import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getVideoStream } from '@ntx-shared/config/api-endpoints';
import { VideoPlayerService } from '@ntx/app/shared/services/videoPlayer/videoPlayer.service';
import { VideoControlsComponent } from './video-controls/video-controls.component';

@Component({
  selector: 'app-video-media-viewer',
  standalone: true,
  imports: [VideoControlsComponent],
  templateUrl: './video-media-viewer.component.html',
  styleUrls: ['./video-media-viewer.component.scss'],
})
export class VideoMediaViewerComponent implements OnInit {
  @ViewChild('videoPlayer', { static: true }) videoPlayerElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;

  streamID: string = '';

  constructor(
    private readonly videoPlayerService: VideoPlayerService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadVideoStreamID();
    this.setupPlayer();
  }

  private async loadVideoStreamID(): Promise<void> {
    this.streamID = this.route.snapshot.paramMap.get('id') ?? '';
  }

  private setupPlayer(): void {
    this.videoPlayerService.initializePlayer(this.videoPlayerElement.nativeElement, getVideoStream(this.streamID));
  }

  getVideoPlayer(): VideoPlayerService {
    return this.videoPlayerService;
  }
}
