import { ApplicationRef, ComponentRef, Injectable, Type, createComponent } from '@angular/core';
import { ModalButton, ModalComponent } from '@ntx-shared/ui/modal.component';

export interface ContentComponent<T> {
  component: Type<T>;
  inputProps?: Partial<T>;
  customClass?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly modalRefs: ComponentRef<ModalComponent>[] = [];

  constructor(private readonly appRef: ApplicationRef) {}

  /**
   * Opens a new modal with the specified configuration.
   *
   * @template T - The type of the content component, if specified.
   * @param id - A unique identifier for the modal instance.
   * @param title - The title text displayed at the top of the modal.
   * @param body - The main text or content displayed in the modal body.
   * @param buttons - An array of button configurations for the modal actions.
   * @param contentComponent - An optional object containing the content component type, properties, and custom CSS class to inject into the modal.
   *
   * @returns An object containing:
   * - `modalRef`: The reference to the created `ModalComponent` instance.
   * - `contentRef`: (optional) The reference to the content component instance, if provided.
   */
  openModal<T>(id: string, title: string, body: string, buttons: ModalButton[], contentComponent?: ContentComponent<T>): { modalRef: ComponentRef<ModalComponent>; contentRef?: ComponentRef<T> } {
    const modalRef = createComponent(ModalComponent, {
      environmentInjector: this.appRef.injector,
    });

    modalRef.instance.id = id;
    modalRef.instance.title = title;
    modalRef.instance.body = body;
    modalRef.instance.buttons = buttons;

    this.appRef.attachView(modalRef.hostView);

    const domElem = modalRef.location.nativeElement;
    document.body.appendChild(domElem);

    let contentRef: ComponentRef<T> | undefined;

    if (contentComponent) {
      contentRef = modalRef.instance.viewContainerRef.createComponent(contentComponent.component);

      if (contentComponent.inputProps) {
        Object.assign(contentRef.instance as object, contentComponent.inputProps);
      }

      if (contentComponent.customClass) {
        contentRef.location.nativeElement.classList.add(contentComponent.customClass);
      }

      contentRef.changeDetectorRef.detectChanges();

      modalRef.instance.contentRef = contentRef;
    }

    this.modalRefs.push(modalRef);

    modalRef.instance.closeModal.subscribe(() => {
      this.closeModal(modalRef);
    });

    return { modalRef, contentRef };
  }

  /**
   * Closes the specified modal and performs necessary cleanup.
   *
   * @param modalRef - The reference to the modal component to be closed.
   */
  closeModal(modalRef: ComponentRef<ModalComponent>) {
    const index = this.modalRefs.indexOf(modalRef);
    if (index !== -1) {
      if (modalRef.instance.contentRef) {
        modalRef.instance.contentRef.destroy();
      }
      this.appRef.detachView(modalRef.hostView);
      modalRef.destroy();
      this.modalRefs.splice(index, 1);
    }
  }
}
