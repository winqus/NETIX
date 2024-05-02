import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alert-card',
  standalone: true,
  imports: [],
  templateUrl: './alert-card.component.html',
})
export class AlertCardComponent {
  @Input() message: string = '';

  @Input() hideCard = true;
  @Output() cardHidden = new EventEmitter<boolean>();

  closeAlert(): void {
    this.hideCard = true;
    this.cardHidden.emit(this.hideCard);
  }
}
