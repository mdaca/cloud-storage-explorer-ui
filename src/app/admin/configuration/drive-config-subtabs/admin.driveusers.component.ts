import {Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Drive} from "../../../models/drive";
import {DriveUser} from "../../../models/driveUser";
import {DriveConfigurationService} from "../drive.configuration.service";
import {DriveConfigSubtabComponent} from "./drive-config-subtab.component";

@Component({
  selector: "drive-users",
  template: `
    <kendo-grid #gridComponent
      [data]="view"
      [pageSize]="gridState.take"
      [skip]="gridState.skip"
      [pageable]="true"
      (keyup)="updateModel()"
      (pageChange)="pageChange($event)"
      (cellClick)="cellClickHandler($event)"
      (cellClose)="cellCloseHandler()"
      (cancel)="cancelHandler()"
      (save)="saveHandler($event)"
      (remove)="removeHandler($event)"
      (add)="addHandler()">
      <ng-template kendoGridToolbarTemplate>
        <button kendoGridAddCommand>Add new</button>
      </ng-template>
      <kendo-grid-column field="userName" [width]="220" title="Administrator Name">
      </kendo-grid-column>
      <kendo-grid-command-column title="&nbsp;" [width]="220">
        <ng-template kendoGridCellTemplate>
          <button kendoGridRemoveCommand>Remove</button>
          <button kendoGridSaveCommand>Add</button>
          <button kendoGridCancelCommand>Cancel</button>
        </ng-template>
      </kendo-grid-command-column>
    </kendo-grid>
  `
})
export class DriveUsersComponent extends DriveConfigSubtabComponent<DriveUser> {

  @Input()
  public drive: Drive = new Drive();
  @Output()
  public formError = new EventEmitter<string[]>();
  @ViewChild("gridComponent")
  public grid: any;
  public clazz = DriveUser;

  constructor(private formBuilder: FormBuilder,
              public driveConfigService: DriveConfigurationService) {
    super(driveConfigService);
  }

  public get gridRecords(): DriveUser[] {
    return this.drive.users;
  }

  public createFormGroup(driveUser: DriveUser): FormGroup {
    return this.formBuilder.group({
      'userName': [driveUser.userName, Validators.required],
    });
  }

}
