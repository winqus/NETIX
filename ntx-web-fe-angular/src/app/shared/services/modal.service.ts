import { ApplicationRef, ComponentRef, Injectable, Type, createComponent } from '@angular/core';
import { ModalComponent } from '../ui/modal/modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalRefs: ComponentRef<ModalComponent>[] = [];

  constructor(private appRef: ApplicationRef) {}

  openModal<T>(
    id: string,
    title: string,
    body: string,
    buttons: any[],
    contentComponent?: Type<T>,
    contentInputs?: Partial<T>,
    customClass?: string
  ): { modalRef: ComponentRef<ModalComponent>; contentRef?: ComponentRef<T> } {
    // Create the modal component dynamically
    const modalRef = createComponent(ModalComponent, {
      environmentInjector: this.appRef.injector,
    });

    // Set inputs on the modal component instance
    modalRef.instance.id = id;
    modalRef.instance.title = title;
    modalRef.instance.body = body;
    modalRef.instance.buttons = buttons;

    // Attach the modal component to the application view
    this.appRef.attachView(modalRef.hostView);

    // Append the modal component's DOM element to the body
    const domElem = modalRef.location.nativeElement;
    document.body.appendChild(domElem);

    let contentRef: ComponentRef<T> | undefined;

    // Dynamically create and inject the content component if provided
    if (contentComponent) {
      contentRef = modalRef.instance.viewContainerRef.createComponent(contentComponent);

      // Assign inputs if any are provided
      if (contentInputs) {
        Object.assign(contentRef.instance as object, contentInputs);
      }

      // Add custom class if provided
      if (customClass) {
        contentRef.location.nativeElement.classList.add(customClass);
      }

      // Trigger change detection
      contentRef.changeDetectorRef.detectChanges();

      modalRef.instance.contentRef = contentRef;
    }

    this.modalRefs.push(modalRef);

    // Subscribe to the close event
    modalRef.instance.closeModal.subscribe(() => {
      this.closeModal(modalRef);
    });

    return { modalRef, contentRef };
  }

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
