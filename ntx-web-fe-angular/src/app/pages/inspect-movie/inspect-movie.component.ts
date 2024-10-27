import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { timer } from 'rxjs/internal/observable/timer';
import { environment } from '@ntx/environments/environment.development';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';
import { PosterSize } from '@ntx-shared/models/posterSize.enum';
import { PosterService } from '@ntx-shared/services/posters/posters.service';
import { TimeDelays } from '@ntx-shared/config/constants';
import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'app-inspect-movie',
  standalone: true,
  imports: [SvgIconsComponent, ReactiveFormsModule, SettingsComponent],
  templateUrl: './inspect-movie.component.html',
  styleUrl: './inspect-movie.component.scss',
})
export class InspectMovieComponent implements OnInit {
  movie: MovieDTO | undefined;
  posterUrl: string | null = null;
  isFromCreation: boolean = false;

  constructor(
    private movieService: MovieService,
    private posterService: PosterService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id') || '';
    const navigation = window.history.state || {};
    this.isFromCreation = navigation.from === 'creation';

    this.movieService.getMovieMetadata(movieId).subscribe({
      next: (response) => {
        if (environment.development) console.log('Upload successful:', response);

        this.movie = response;

        // this.populateEditForm(this.movie.name, this.movie.summary, this.movie.originallyReleasedAt, this.movie.runtimeMinutes);

        if (this.isFromCreation) {
          timer(TimeDelays.posterProcessingDelay).subscribe(() => this.loadPoster(this.movie!.posterID, PosterSize.L));
        } else {
          this.loadPoster(this.movie!.posterID, PosterSize.L);
        }
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error uploading metadata:', errorResponse);
      },
    });
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
