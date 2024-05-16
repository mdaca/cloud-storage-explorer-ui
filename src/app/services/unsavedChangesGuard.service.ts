import {CanDeactivate} from '@angular/router';
import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {ConfirmChangesComponent} from "../interfaces/confirm-changes.interface";
import {ConfirmLeaveComponent} from "../layout/confirm-leave-modal/confirm-leave-modal.component";
import {BsModalService} from "ngx-bootstrap/modal";

@Injectable()
export class UnsavedChangesGuardService implements CanDeactivate<ConfirmChangesComponent> {

  constructor(private modalService: BsModalService) {
  }

  canDeactivate(component: ConfirmChangesComponent) {
    if (!component) {
      return true;
    }
    if (!component.isSaved()) {
      const subject = new Subject<boolean>();

      const modal = this.modalService.show(ConfirmLeaveComponent);
      // @ts-ignore
      modal.content.confirmLeaveSubject = subject;
      // @ts-ignore
      modal.content.confirmChangesComponent = component;

      return subject.asObservable();
    }

    return true;
  }

}
