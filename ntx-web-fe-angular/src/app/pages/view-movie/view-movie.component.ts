import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { getPoster } from '@ntx/app/shared/config/api-endpoints';
import { CssColor, TimeDelays, MediaConstants } from '@ntx/app/shared/config/constants';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { PosterSize } from '@ntx/app/shared/models/posterSize.enum';
import { VideoDTO } from '@ntx/app/shared/models/video.dto';
import { ImageService } from '@ntx/app/shared/services/image.service';
import { MovieService } from '@ntx/app/shared/services/movie/movie.service';
import { PosterService } from '@ntx/app/shared/services/posters/posters.service';
import { VideoService } from '@ntx/app/shared/services/videos/video.service';
import { SvgIconsComponent } from '@ntx/app/shared/ui/svg-icons.component';
import { environment } from '@ntx/environments/environment';
import { timer } from 'rxjs';

@Component({
  selector: 'app-view-movie',
  standalone: true,
  imports: [SvgIconsComponent],
  templateUrl: './view-movie.component.html',
  styleUrl: './view-movie.component.scss',
})
export class ViewMovieComponent {
  movie: MovieDTO | undefined;
  video: VideoDTO | undefined;
  posterUrl: string | null = null;
  backdropUrl: string | null = null;
  backdropColor: string = CssColor.TitleInspectBackgroundColor;
  pageBackgroundColor: string = CssColor.TitleInspectBackgroundColor;
  transparentColor: string = CssColor.TransparentColor;
  isFromCreation: boolean = false;
  uploadProgress: number = 0;
  isUploadingVideo: boolean = false;

  constructor(
    private readonly movieService: MovieService,
    private readonly posterService: PosterService,
    private readonly imageService: ImageService,
    private readonly videoService: VideoService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id') ?? '';
    const navigation = window.history.state || {};
    this.isFromCreation = navigation.from === 'creation';

    this.getMovieMetadata(movieId);
  }

  getMovieMetadata(movieId: string) {
    this.movieService.getMovieMetadata(movieId).subscribe({
      next: (response) => {
        if (environment.development) console.log('Upload successful:', response);

        this.movie = response;
        if (this.isFromCreation) {
          timer(TimeDelays.posterProcessingDelay).subscribe(() => {
            this.loadPoster(this.movie!.posterID, PosterSize.L);
            this.loadBackdrop(this.movie!.backdropID!);
          });
        } else {
          this.loadPoster(this.movie.posterID, PosterSize.L);
          this.loadBackdrop(this.movie.backdropID!);
        }

        if (this.movie?.videoID != null) {
          this.videoService.getVideoPropsUrl(this.movie?.videoID).subscribe({
            next: (response) => {
              if (environment.development) console.log('Video props successful:', response);
              this.video = response;
            },
            error: (errorResponse) => {
              if (environment.development) console.error('Error video props:', errorResponse);
            },
          });
        }
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error uploading metadata:', errorResponse);
        this.router.navigate(['error']);
      },
    });
  }

  loadPoster(id: string, size: string): void {
    this.posterUrl = getPoster(id, size);
  }

  onPosterError(): void {
    this.posterUrl = null;
  }
  onWatchMovie(): void {
    this.router.navigate(['/watch/movie', this.movie?.id]);
  }
  loadBackdrop(id: string): void {
    if (id == null) return;

    this.posterService.getBackdrop(id).subscribe({
      next: async (blob: Blob) => {
        this.backdropUrl = URL.createObjectURL(blob);
        const backdropFile = new File([blob], 'backdrop.' + MediaConstants.image.exportFileExtension, {
          type: MediaConstants.image.exportMimeType,
          lastModified: Date.now(),
        });
        const getData = await this.imageService.getAverageColor(backdropFile);

        this.backdropColor = 'rgba(' + getData.r + ', ' + getData.g + ',  ' + getData.b + ', 0.5)';
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error loading backdrop:', errorResponse);
        this.backdropUrl = null;
      },
    });
  }

  isVideoAvailable(): boolean {
    return !!this.movie?.videoID;
  }

  getVideoName(): string {
    if (this.video == null) return this.movie!.name;

    return this.video?.name;
  }

  getRuntimeLabel(): string {
    if (this.movie?.runtimeMinutes == undefined) return '';

    let totalSeconds = Math.floor(this.movie?.runtimeMinutes * 60);

    const hours: number = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes: number = Math.floor(totalSeconds / 60);

    let formattedTimeString: string = '';

    if (hours > 0) formattedTimeString += `${hours}h `;

    formattedTimeString += `${minutes}m`;

    return formattedTimeString;
  }
}
