import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

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
  searchFailed?: boolean;
  results?: string[];
}

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [],
  templateUrl: './textarea.component.html',
})
export class TextareaComponent implements OnChanges {
  @Input() props: InputProps = {};

  @Output() changedValue = new EventEmitter<string>();
  @Output() changeEvent = new EventEmitter<Event>();
  @Output() searchEvent = new EventEmitter<string>();
  @Output() optionSelected = new EventEmitter<any>();

  defaultProps: InputProps = {
    title: '',
    type: '',
    accept: '',
    placeholder: '',
    value: '',
    iconName: '',
    disabled: false,
    readonly: false,
    searchFailed: false,
    results: [],
  };

  ngOnChanges(): void {
    this.props = { ...this.defaultProps, ...this.props };
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.changedValue.emit(input.value);
    this.changeEvent.emit(event);
  }

  onOptionClick(option: string) {
    this.optionSelected.emit(option);
  }
}
