import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { UploadService } from '@ntx/app/shared/services/upload/upload.service';
import { environment } from '@ntx/environments/environment.development';
import { SvgIconsComponent } from '@ntx/app/shared/ui/svg-icons/svg-icons.component';
import { PosterSize } from '@ntx/app/shared/models/posterSize.enum';
import { PosterService } from '@ntx/app/shared/services/posters/posters.service';

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

  constructor(
    private uploadService: UploadService,
    private posterService: PosterService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id') || '';

    this.uploadService.getMovieMetadata(movieId).subscribe({
      next: (response) => {
        if (environment.development) console.log('Upload successful:', response);
        this.movie = response;
        this.loadPoster(this.movie?.posterID, PosterSize.L);
        if (environment.development) console.log(this.movie);
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error uploading metadata:', errorResponse);
      },
    });
    throw new Error('Method not implemented.');
  }

  loadPoster(id: string, size: string): void {
    this.posterService.getPoster(id, size).subscribe({
      next: (blob: Blob) => {
        this.posterUrl = URL.createObjectURL(blob);
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error loading poster:', errorResponse);
      },
    });
  }
}
