import { Component, ComponentRef, EventEmitter, Input, Output } from '@angular/core';
import { SvgIconsComponent } from '../svg-icons/svg-icons.component';

interface ModalButton {
  text: string;
  class: string;
  action: () => void;
  shouldClose: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [SvgIconsComponent],
  templateUrl: './modal.component.html',
})
export class ModalComponent {
  @Input() id!: string;
  @Input() title!: string;
  @Input() body!: string;
  @Input() buttons!: ModalButton[];
  @Output() closeModal = new EventEmitter<void>();

  contentRef?: ComponentRef<any>;

  onButtonAction(action: () => void, shouldClose: boolean = false) {
    action();
    if (shouldClose) {
      this.closeModal.emit();
    }
  }

  onClose() {
    this.closeModal.emit();
  }
}
