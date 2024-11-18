import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { timer } from 'rxjs/internal/observable/timer';
import { environment } from '@ntx/environments/environment.development';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { SvgIconsComponent } from '@ntx/app/shared/ui/svg-icons.component';
import { PosterSize } from '@ntx-shared/models/posterSize.enum';
import { PosterService } from '@ntx-shared/services/posters/posters.service';
import { CssColor, MediaConstants, TimeDelays } from '@ntx-shared/config/constants';
import { ChangePosterComponent } from './settings/change-poster/change-poster.component';
import { EditMetadataComponent } from './settings/edit-metadata/edit-metadata.component';
import { PublishMovieComponent } from './settings/publish-movie/publish-movie.component';
import { ChangeBackdropComponent } from './settings/change-backdrop/change-backdrop.component';
import { UploadVideoComponent } from './settings/upload-video/upload-video.component';
import { ImageService } from '@ntx-shared/services/image.service';
import { getPoster } from '@ntx-shared/config/api-endpoints';
import { VideoService } from '@ntx-shared/services/videos/video.service';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';
import { VideoDTO } from '@ntx/app/shared/models/video.dto';
import { Subscription } from 'rxjs';
import { RemoveMovieComponent } from './settings/remove-movie/remove-movie.component';

@Component({
  selector: 'app-inspect-movie',
  standalone: true,
  imports: [SvgIconsComponent, ChangePosterComponent, ChangeBackdropComponent, PublishMovieComponent, EditMetadataComponent, UploadVideoComponent, RemoveMovieComponent],
  templateUrl: './inspect-movie.component.html',
  styleUrl: './inspect-movie.component.scss',
})
export class InspectMovieComponent implements OnInit, OnDestroy {
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
  private uploadProgressSubscription: Subscription | null = null;

  constructor(
    private readonly movieService: MovieService,
    private readonly posterService: PosterService,
    private readonly imageService: ImageService,
    private readonly videoService: VideoService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id') ?? '';
    const navigation = window.history.state || {};
    this.isFromCreation = navigation.from === 'creation';

    this.getMovieMetadata(movieId);
  }

  ngOnDestroy(): void {
    this.uploadProgressSubscription?.unsubscribe();
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

  onMovieLoad(updatedMovie: MovieDTO) {
    if (this.movie?.posterID != updatedMovie.posterID) {
      timer(TimeDelays.posterProcessingDelay).subscribe(() => this.loadPoster(updatedMovie.posterID, PosterSize.L));
    }

    if (this.movie?.backdropID != updatedMovie.backdropID) {
      timer(TimeDelays.backdropProcessingDelay).subscribe(() => this.loadBackdrop(updatedMovie.backdropID as string));
    }

    this.movie = updatedMovie;
  }

  loadPoster(id: string, size: string): void {
    this.posterUrl = getPoster(id, size);
  }

  onPosterError(): void {
    this.posterUrl = null;
  }
  onWatchMovie(): void {
    this.router.navigate(['/watch/movie', this.movie?.videoID], { state: { data: this.movie?.name } });
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

  onUploadVideo(file: File): void {
    this.isUploadingVideo = true;
    this.uploadProgress = 0;

    this.uploadProgressSubscription?.unsubscribe();

    this.uploadProgressSubscription = this.videoService.uploadProgress$.subscribe({
      next: (progress) => {
        this.uploadProgress = progress;
      },
      error: (error) => console.error('Error in progress subscription:', error),
    });

    this.videoService
      .uploadVideo(file, this.movie!.id)
      .then(() => {
        this.errorHandler.showSuccess('Video uploaded successfully');
        timer(TimeDelays.videoProcessingDelay).subscribe(() => this.getMovieMetadata(this.movie!.id));
        this.isUploadingVideo = false;
        this.uploadProgressSubscription?.unsubscribe();
      })
      .catch((error) => {
        if (environment.development) console.error('Upload error:', error);
        this.errorHandler.showError('An error occurred while uploading your video. Please try again later.', 'Upload unsuccessful');
        this.isUploadingVideo = false;
        this.uploadProgressSubscription?.unsubscribe();
      });
  }

  isVideoAvailable(): boolean {
    return !!this.movie?.videoID;
  }

  getVideoName(): string {
    if (this.video == null) return this.movie!.name;

    return this.video?.name;
  }
}
