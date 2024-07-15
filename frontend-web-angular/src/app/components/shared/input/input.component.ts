import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SvgIconsComponent } from '../../svg-icons/svg-icons.component';
import { debounceTime, Subject } from 'rxjs';

export interface InputProps {
  title?: string;
  type?: string;
  accept?: string;
  placeholder?: string;
  value?: string;
  iconName?: string;
  disabled?: boolean;
  readonly?: boolean;
  searchCharLimit?: string;
  results?: string[];
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [SvgIconsComponent],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
})
export class InputComponent implements OnChanges {
  @Input() props: InputProps = {};

  @Output() changedValue = new EventEmitter<string>();
  @Output() changeEvent = new EventEmitter<Event>();
  @Output() searchEvent = new EventEmitter<string>();
  @Output() optionSelected = new EventEmitter<any>();

  tempIconName: string = '';
  private searchSubject = new Subject<string>();

  defaultProps: InputProps = {
    title: '',
    type: '',
    accept: '',
    placeholder: '',
    value: '',
    iconName: '',
    disabled: false,
    readonly: false,
    searchCharLimit: '3',
    results: [],
  };

  constructor() {
    this.searchSubject.pipe(debounceTime(500)).subscribe((searchText) => {
      if (this.props.searchCharLimit != undefined && searchText.length >= parseInt(this.props.searchCharLimit, 10)) {
        this.searchEvent.emit(searchText);
        this.tempIconName = this.props.iconName!;
        this.props.iconName = 'throbber';
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.props = { ...this.defaultProps, ...this.props };

    if (changes['props'] && this.props.results && this.props.results.length > 0) {
      this.props.iconName = this.tempIconName;
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
    this.props.iconName = this.tempIconName;
  }
}
