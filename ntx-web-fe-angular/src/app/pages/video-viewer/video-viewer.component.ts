import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getVideoStream } from '@ntx-shared/config/api-endpoints';
import { VideoPlayerService } from '@ntx/app/shared/services/videoPlayer/videoPlayer.service';
import { VideoControlsComponent } from './video-controls/video-controls.component';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';

@Component({
  selector: 'app-video-viewer',
  standalone: true,
  imports: [VideoControlsComponent],
  templateUrl: './video-viewer.component.html',
  styleUrls: ['./video-viewer.component.scss'],
})
export class VideoViewerComponent implements OnInit {
  @ViewChild('videoPlayer', { static: true }) videoPlayerElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;

  movieID: string = '';
  titleName: string = '';

  constructor(
    private readonly videoPlayerService: VideoPlayerService,
    private readonly movieService: MovieService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadMovieID();
    this.getMovieMetadata();
    this.videoPlayerService.togglePlay();
  }

  getMovieMetadata() {
    this.movieService.getMovieMetadata(this.movieID).subscribe({
      next: (response) => {
        this.titleName = response.name;
        this.setupPlayer(response.videoID!, 'video/mp4');
      },
      error: () => {
        this.router.navigate(['error']);
      },
    });
  }

  getVideoPlayer(): VideoPlayerService {
    return this.videoPlayerService;
  }

  getVideoTitleLabel(): string {
    return this.titleName;
  }

  private async loadMovieID(): Promise<void> {
    this.movieID = this.route.snapshot.paramMap.get('id') ?? '';
  }

  private setupPlayer(streamSource: string, type: string): void {
    this.videoPlayerService.initializePlayer(this.videoPlayerElement.nativeElement, getVideoStream(streamSource), type);

    this.videoPlayerService.playerReady$.subscribe((isReady) => {
      if (isReady) {
        this.videoPlayerService.togglePlay();
      }
    });
  }
}
