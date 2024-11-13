import { Component, ComponentRef, EventEmitter, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { SvgIconsComponent } from './svg-icons.component';

export interface ModalButton {
  text: string;
  class: string;
  action: () => void;
  shouldClose: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [SvgIconsComponent],
  template: `<div [id]="id" class="modal modal-open modal-middle">
    <div class="modal-box">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">{{ title }}</h3>
        <button class="btn-sm btn-circle bg-black flex items-center justify-center" type="button" (click)="onClose()">
          <app-svg-icons name="x" size="20" color="white"></app-svg-icons>
        </button>
      </div>
      <div class="mb-3 overflow-hidden text-ellipsis whitespace-wrap">{{ body }}</div>

      <ng-container #dynamicContent [class]="contentClass"></ng-container>

      <div class="modal-action">
        @for (button of buttons; track button) {
          <button [class]="button.class" [disabled]="button.disabled" type="button" (click)="onButtonAction(button.action, button.shouldClose)">
            {{ button.text }}
          </button>
        }
      </div>
    </div>
  </div>`,
})
export class ModalComponent {
  @Input() id!: string;
  @Input() title!: string;
  @Input() body!: string;
  @Input() buttons!: ModalButton[];
  @Input() contentClass!: string;
  @Output() closeModal = new EventEmitter<void>();

  @ViewChild('dynamicContent', { read: ViewContainerRef, static: true }) viewContainerRef!: ViewContainerRef;
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
