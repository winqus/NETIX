import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { timer } from 'rxjs/internal/observable/timer';
import { environment } from '@ntx/environments/environment.development';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';
import { PosterSize } from '@ntx-shared/models/posterSize.enum';
import { PosterService } from '@ntx-shared/services/posters/posters.service';
import { TimeDelays } from '@ntx-shared/config/constants';
import { ImageUploadComponent } from '@ntx/app/shared/ui/image-upload/image-upload.component';
import { ChangePosterComponent } from './settings/change-poster/change-poster.component';
import { EditMetadataComponent } from './settings/edit-metadata/edit-metadata.component';
import { PublishMovieComponent } from './settings/publish-movie/publish-movie.component';

@Component({
  selector: 'app-inspect-movie',
  standalone: true,
  imports: [SvgIconsComponent, ReactiveFormsModule, ImageUploadComponent, ChangePosterComponent, PublishMovieComponent, EditMetadataComponent],
  templateUrl: './inspect-movie.component.html',
  styleUrl: './inspect-movie.component.scss',
})
export class InspectMovieComponent implements OnInit {
  movie: MovieDTO | undefined;
  posterUrl: string | null = null;
  isFromCreation: boolean = false;

  constructor(
    private readonly movieService: MovieService,
    private readonly posterService: PosterService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id') ?? '';
    const navigation = window.history.state || {};
    this.isFromCreation = navigation.from === 'creation';

    this.movieService.getMovieMetadata(movieId).subscribe({
      next: (response) => {
        if (environment.development) console.log('Upload successful:', response);

        this.movie = response;
        if (this.isFromCreation) {
          timer(TimeDelays.posterProcessingDelay).subscribe(() => this.loadPoster(this.movie!.posterID, PosterSize.L));
        } else {
          this.loadPoster(this.movie.posterID, PosterSize.L);
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
    this.movie = updatedMovie;
  }

  loadPoster(id: string, size: string): void {
    this.posterService.getPoster(id, size).subscribe({
      next: (blob: Blob) => {
        this.posterUrl = URL.createObjectURL(blob);
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error loading poster:', errorResponse);
        this.posterUrl = null;
      },
    });
  }
}
