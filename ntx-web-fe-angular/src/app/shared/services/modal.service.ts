import { ApplicationRef, ComponentRef, Injectable, Type, createComponent } from '@angular/core';
import { ModalComponent } from '@ntx-shared/ui/modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly modalRefs: ComponentRef<ModalComponent>[] = [];

  constructor(private readonly appRef: ApplicationRef) {}

  openModal<T>(
    id: string,
    title: string,
    body: string,
    buttons: any[],
    contentComponent?: Type<T>,
    contentInputs?: Partial<T>,
    customClass?: string
  ): { modalRef: ComponentRef<ModalComponent>; contentRef?: ComponentRef<T> } {
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
      contentRef = modalRef.instance.viewContainerRef.createComponent(contentComponent);

      if (contentInputs) {
        Object.assign(contentRef.instance as object, contentInputs);
      }

      if (customClass) {
        contentRef.location.nativeElement.classList.add(customClass);
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
