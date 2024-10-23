import { ApplicationRef, ComponentFactoryResolver, ComponentRef, Injectable, Injector } from '@angular/core';
import { ModalComponent } from '../ui/modal/modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalRefs: ComponentRef<ModalComponent>[] = [];

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  openPopup(id: string, title: string, body: string, buttons: any[]): ComponentRef<ModalComponent> {
    const modalRef = this.componentFactoryResolver.resolveComponentFactory(ModalComponent).create(this.injector);

    modalRef.instance.id = id;
    modalRef.instance.title = title;
    modalRef.instance.body = body;
    modalRef.instance.buttons = buttons;
    this.appRef.attachView(modalRef.hostView);

    const domElem = (modalRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    this.modalRefs.push(modalRef);

    modalRef.instance.closeModal.subscribe(() => {
      this.closePopup(modalRef);
    });

    return modalRef;
  }

  closePopup(modalRef: ComponentRef<ModalComponent>) {
    const index = this.modalRefs.indexOf(modalRef);
    if (index !== -1) {
      this.appRef.detachView(modalRef.hostView);
      modalRef.destroy();
      this.modalRefs.splice(index, 1);
    }
  }
}
