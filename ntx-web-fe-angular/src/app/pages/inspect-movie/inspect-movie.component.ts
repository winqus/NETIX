import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@ntx/environments/environment.development';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { UploadService } from '@ntx-shared/services/upload/upload.service';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';
import { PosterSize } from '@ntx-shared/models/posterSize.enum';
import { PosterService } from '@ntx-shared/services/posters/posters.service';
import { timer } from 'rxjs';

@Component({
  selector: 'app-inspect-movie',
  standalone: true,
  imports: [SvgIconsComponent],
  templateUrl: './inspect-movie.component.html',
  styleUrl: './inspect-movie.component.scss',
})
export class InspectMovieComponent implements OnInit {
  movie: MovieDTO | undefined;
  posterUrl: string | null = null;
  isFromCreation: boolean = false;

  constructor(
    private uploadService: UploadService,
    private posterService: PosterService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id') || '';
    const navigation = window.history.state;
    this.isFromCreation = navigation.from === 'creation';

    this.uploadService.getMovieMetadata(movieId).subscribe({
      next: (response) => {
        if (environment.development) console.log('Upload successful:', response);
        this.movie = response;
        // this.loadPoster(this.movie?.posterID, PosterSize.L);

        if (this.isFromCreation) {
          timer(3000).subscribe(() => this.loadPoster(this.movie!.posterID, PosterSize.L));
        } else {
          this.loadPoster(this.movie!.posterID, PosterSize.L);
        }
        console.log(this.posterUrl);
        if (environment.development) console.log(this.movie);
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
        console.log(this.posterUrl);
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error loading poster:', errorResponse);
        this.posterUrl = null;
        console.log('no image wtf');
      },
    });
  }
}
