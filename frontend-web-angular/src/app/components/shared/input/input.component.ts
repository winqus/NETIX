import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SvgIconsComponent } from '../../svg-icons/svg-icons.component';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [SvgIconsComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent {
  @Input() title: string = '';
  @Input() type: string = '';
  @Input() accept: string = '';
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() iconName: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;

  @Output() modelChange = new EventEmitter<string>();
  @Output() changeEvent = new EventEmitter<Event>();
  results = [
    { id: 1, name: 'Angular For Beginners' },
    { id: 2, name: 'Angular Core Deep Dive' },
    { id: 3, name: 'Angular Forms In Depth' },
    { id: 4, name: 'Angular For Beginners' },
    { id: 5, name: 'Angular Core Deep Dive' },
    { id: 6, name: 'Angular Forms In Depth' },
    { id: 7, name: 'Angular For Beginners' },
    { id: 8, name: 'Angular Core Deep Dive' },
    { id: 9, name: 'Angular Forms In Depth' },
  ];

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.modelChange.emit(input.value);
    this.changeEvent.emit(event);
  }
}
