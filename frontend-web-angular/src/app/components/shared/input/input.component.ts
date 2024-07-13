import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SvgIconsComponent } from '../../svg-icons/svg-icons.component';
import { debounceTime, Subject } from 'rxjs';

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
  @Input() results: string[] = [];

  @Output() changedValue = new EventEmitter<string>();
  @Output() changeEvent = new EventEmitter<Event>();
  @Output() searchEvent = new EventEmitter<string>();
  @Output() optionSelected = new EventEmitter<any>();

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(debounceTime(500)).subscribe((searchText) => {
      this.searchEvent.emit(searchText);
    });
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.changedValue.emit(input.value);
    this.changeEvent.emit(event);
    this.searchSubject.next(input.value);
  }

  onOptionClick(option: string) {
    this.optionSelected.emit(option);
  }
}
