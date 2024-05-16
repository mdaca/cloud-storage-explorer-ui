import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

import {Drive} from '../../../models/drive';
import {DriveProperty} from "../../../models/driveProperty";
import {DriveConfigurationService} from "../drive.configuration.service";
import {DriveConfigSubtabComponent} from "./drive-config-subtab.component";

@Component({
  selector: 'drive-properties',
  template: `
      <kendo-grid #gridComponent
                  [data]="view"
                  [pageSize]="gridState.take"
                  [skip]="gridState.skip"
                  [pageable]="true"
                  (keyup)="updateModel()"
                  (pageChange)="pageChange($event)"
                  (cellClick)="cellClickHandler($event)"
                  (cellClose)="cellCloseHandler()">
          <kendo-grid-column [editable]="false" field="propertyKey" title="Key">
          </kendo-grid-column>
          <kendo-grid-column field="propertyValue" title="Value">
              <ng-template kendoGridCellTemplate let-driveProperty>
                  {{ (!!driveProperty.propertyValue) ? "******" : "" }}
              </ng-template>
          </kendo-grid-column>
      </kendo-grid>
  `
})
export class DrivePropertyComponent extends DriveConfigSubtabComponent<DriveProperty> {

  /** The category for which details are displayed */
  @Input()
  public drive: Drive = new Drive();
  @Output()
  public formError: EventEmitter<string[]> = new EventEmitter<string[]>();
  @ViewChild("gridComponent")
  public grid: any;
  public clazz = DriveProperty;

  constructor(private formBuilder: FormBuilder,
              public adminDriveService: DriveConfigurationService) {
    super(adminDriveService);
  }

  public get gridRecords(): DriveProperty[] {
    return this.drive.providerProperties;
  }

  public createFormGroup(property: DriveProperty): FormGroup {
    return this.formBuilder.group({
      'propertyKey': [property.propertyKey],
      'propertyValue': [property.propertyValue]
    });
  }

}
