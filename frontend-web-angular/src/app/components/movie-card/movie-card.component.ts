import { Component, Input } from '@angular/core';
import { Video } from '../../models/video';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  public _video?: Video;

  isLoading: boolean = true;

  @Input()
  set video(value: Video) {
    this._video = value;
    this.isLoading = !value;
  }
  get title(): string {
    return this._video?.title || '-';
  }
  get publishedDate(): string {
    if (!this._video || !this._video.publishedAt) return 'N/D';
    const date = this._video?.publishedAt;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}`;
    return `${year}-${month}-${day}`;
  }
  get formattedDuration(): string {
    if (!this._video || !this._video.duration) return '00:00:00';
    const duration = this._video.duration;
    const hours = Math.floor(duration / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((duration % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (duration % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}
