import { Component, OnInit } from '@angular/core';
import { MovieCardComponent } from '@ntx/app/pages/movie-list/movie-card/movie-card.component';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { environment } from '@ntx/environments/environment.development';

@Component({
  selector: 'app-example',
  standalone: true,
  templateUrl: './movie-list.component.html',
  imports: [MovieCardComponent],
})
export class MovieListComponent implements OnInit {
  title = 'netix';

  skeletonNumber: number[] = Array.from({ length: 20 }, (_, i) => i);
  movies: MovieDTO[] = [];

  isLoadingMovies: boolean = true;
  constructor(private movieService: MovieService) {}

  ngOnInit() {
    this.movieService.getMovies().subscribe({
      next: (response) => {
        console.log(response);
        this.movies = response;
        this.movies.sort((a, b) => new Date(b.originallyReleasedAt).getTime() - new Date(a.originallyReleasedAt).getTime());
        this.isLoadingMovies = false;
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error uploading metadata:', errorResponse);
      },
    });
  }
}
