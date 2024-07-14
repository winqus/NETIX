import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SvgIconsComponent } from '../../svg-icons/svg-icons.component';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [SvgIconsComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent implements OnChanges {
  @Input() title: string = '';
  @Input() type: string = '';
  @Input() accept: string = '';
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() iconName: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() searchCharLimit: string = '';
  @Input() results: string[] = [];

  @Output() changedValue = new EventEmitter<string>();
  @Output() changeEvent = new EventEmitter<Event>();
  @Output() searchEvent = new EventEmitter<string>();
  @Output() optionSelected = new EventEmitter<any>();

  tempIconName: string = '';
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(debounceTime(500)).subscribe((searchText) => {
      if (this.searchCharLimit != '' && searchText.length >= parseInt(this.searchCharLimit, 10)) {
        this.searchEvent.emit(searchText);
        this.tempIconName = this.iconName;
        this.iconName = 'throbber';
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['results']) {
      if (this.results.length > 0) {
        this.iconName = this.tempIconName;
      }
    }
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.changedValue.emit(input.value);
    this.changeEvent.emit(event);
    this.searchSubject.next(input.value);
  }

  onOptionClick(option: string) {
    this.optionSelected.emit(option);
    this.iconName = this.tempIconName;
  }
}
