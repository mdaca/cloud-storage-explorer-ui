import {Component} from '@angular/core';
import {BsModalRef} from "ngx-bootstrap/modal";
import {Subject} from "rxjs";
import {ConfirmChangesComponent} from "../../interfaces/confirm-changes.interface";

@Component({
  selector: 'app-confirm-leave',
  templateUrl: './confirm-leave-modal.component.html',
  styleUrls: ['./confirm-leave-modal.component.scss']
})
export class ConfirmLeaveComponent {

  // @ts-ignore
  public confirmLeaveSubject: Subject<boolean>;
  // @ts-ignore
  public confirmChangesComponent: ConfirmChangesComponent;

  public width: number = 500;
  //0 is center, but doesn't register properly in kendo-window, so use -1
  public left: number = -1;

  constructor(public bsModalRef: BsModalRef) {
  }

  cancel() {
    //passing FALSE will PREVENT the component from navigating away
    this.action(false);
  }

  discardAndExit() {
    //passing TRUE will ALLOW the component to navigate away
    this.action(true);
  }

  saveAndExit() {
    let successfulSave = this.validatedSave();

    //if the save was successful, allow leaving from the screen
    this.action(successfulSave);
  }

  action(allowLeave: boolean) {
    this.bsModalRef.hide();
    this.confirmLeaveSubject.next(allowLeave);
    this.confirmLeaveSubject.complete();
  }

  public validatedSave(): boolean {
    if (this.confirmChangesComponent.isValid()) {
      this.confirmChangesComponent.save();
    } else {
      this.confirmChangesComponent.showErrorModal();
    }

    return this.confirmChangesComponent.isValid();
  }

}
