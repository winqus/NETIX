import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PosterProcessingService {
  private posterReadySubject = new Subject<void>();

  notifyPosterReady(): void {
    this.posterReadySubject.next();
  }

  onPosterReady() {
    return this.posterReadySubject.asObservable();
  }
}
