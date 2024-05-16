import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {Drive} from '../../../models/drive';
import {DriveSecurityRule} from "../../../models/driveSecurityRule";
import {DriveConfigurationService} from '../drive.configuration.service';
import {DriveConfigSubtabComponent} from "./drive-config-subtab.component";

@Component({
  selector: 'drive-security',
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
          <kendo-grid-column field="roleName" [width]="220" title="Role Name">
          </kendo-grid-column>
          <kendo-grid-column field="users" [width]="220" title="Users">
          </kendo-grid-column>
          <kendo-grid-column field="ruleText" [width]="220" title="Rule Text">
          </kendo-grid-column>
          <kendo-grid-column field="accessLevel" [width]="90" title="Access Level">
              <ng-template kendoGridCellTemplate let-securityRule>
                  {{ getAccessLevelText(securityRule.accessLevel) }}
              </ng-template>
              <ng-template kendoGridEditTemplate let-formGroup="formGroup">
                  <kendo-dropdownlist
                          (ngModelChange)="updateModel()"
                          [data]="accessLevels"
                          [textField]="'text'"
                          [valuePrimitive]="true"
                          [valueField]="'value'"
                          [formControl]="formGroup.get('accessLevel')">
                  </kendo-dropdownlist>
              </ng-template>
          </kendo-grid-column>
          <kendo-grid-column field="exclude" [width]="120" title="Exclude if matches?">
              <ng-template kendoGridEditTemplate let-securityRule>
                  <input type=checkbox [(ngModel)]="securityRule.exclude" ngDefaultControl title="Exclude if matches?"/>
              </ng-template>
          </kendo-grid-column>
          <kendo-grid-command-column title="&nbsp;" [width]="120">
              <ng-template kendoGridCellTemplate>
                  <button kendoGridRemoveCommand>Remove</button>
                  <button kendoGridSaveCommand>Add</button>
                  <button kendoGridCancelCommand>Cancel</button>
              </ng-template>
          </kendo-grid-command-column>
      </kendo-grid>
  `
})
export class DriveSecurityComponent extends DriveConfigSubtabComponent<DriveSecurityRule> {

  /**
   * The category for which details are displayed
   */
  @Input()
  public drive: Drive = new Drive();
  @Output()
  public formError = new EventEmitter<string[]>();
  @ViewChild("gridComponent")
  public grid: any;
  public clazz = DriveSecurityRule;

  public accessLevels: any[] = [
    {text: 'Read', value: 'R'},
    {text: 'Create', value: 'C'},
    {text: 'Modify', value: 'M'},
    {text: 'Delete', value: 'D'},
    {text: 'Restore', value: 'U'},
    {text: 'Archive', value: 'A'}
  ];

  public getAccessLevelText(value: string) {
    let accessLevel = this.accessLevels.find(al => al.value == value);
    return accessLevel ? accessLevel.text : "";
  }

  constructor(public configService: DriveConfigurationService,
              private formBuilder: FormBuilder) {
    super(configService);
  }

  get gridRecords(): DriveSecurityRule[] {
    return this.drive.securityRules;
  }

  public createFormGroup(rule: DriveSecurityRule): FormGroup {
    return this.formBuilder.group({
      'roleName': [rule.roleName],
      'ruleText': [rule.ruleText, Validators.required],
      'users': [rule.users],
      'accessLevel': [rule.accessLevel],
      'exclude': [rule.exclude]
    });
  }

}
