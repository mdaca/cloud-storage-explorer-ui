import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule} from "@angular/material/radio";
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {GridModule} from '@progress/kendo-angular-grid';
import {DropDownsModule} from '@progress/kendo-angular-dropdowns';
import {DateInputsModule} from '@progress/kendo-angular-dateinputs';
import {LabelModule} from "@progress/kendo-angular-label";
import {FormFieldModule, NumericTextBoxModule, TextBoxModule} from "@progress/kendo-angular-inputs";
import {LayoutModule} from '@progress/kendo-angular-layout';
import {WindowModule} from "@progress/kendo-angular-dialog";
import {ButtonModule} from '@progress/kendo-angular-buttons';
import {ChartsModule} from "@progress/kendo-angular-charts";
import {TreeViewModule} from "@progress/kendo-angular-treeview";

import {BsModalService} from "ngx-bootstrap/modal";
import {LayoutModule as MdacaLayoutModule} from "../layout/layout.module";

import {DriveUsersComponent} from "./configuration/drive-config-subtabs/admin.driveusers.component";
import {AdminComponent} from './admin.component';
import {AdminRoutingModule} from './admin-routing.module';
import {DrivePropertyComponent} from './configuration/drive-config-subtabs/admin.driveproperties.component';
import {DriveSecurityComponent} from './configuration/drive-config-subtabs/admin.drivesecurity.component';
import {ConfigurationComponent} from "./configuration/configuration.component";
import {DriveConfigurationService} from "./configuration/drive.configuration.service";
import {DatePickerFilterComponent} from "./audit-event-log/datepicker-filter.component";
import {DropDownListFilterComponent} from "./audit-event-log/dropdownlist-filter.component";
import {WorkspaceConfigService} from "../layout/header/workspaceConfig.service";
import {UnsavedChangesGuardService} from "../services/unsavedChangesGuard.service";
import {ConfirmLeaveComponent} from "../layout/confirm-leave-modal/confirm-leave-modal.component";
import {DriveMetricsComponent} from "./metrics/drive-metrics.component";
import {AuditEventLogComponent} from "./audit-event-log/audit-event-log.component";

@NgModule({
  declarations: [
    AdminComponent, DrivePropertyComponent, DriveSecurityComponent, DropDownListFilterComponent,
    DatePickerFilterComponent, DriveUsersComponent, ConfirmLeaveComponent, DriveMetricsComponent,
    AuditEventLogComponent, ConfigurationComponent
  ],
  providers: [
    //Angular
    DatePipe,
    //bootstrap
    BsModalService,
    //internal
    DriveConfigurationService, WorkspaceConfigService, UnsavedChangesGuardService],
  imports: [
    //Angular
    BrowserAnimationsModule, BrowserModule, CommonModule, FormsModule, MatFormFieldModule, MatRadioModule,
    ReactiveFormsModule,
    //Kendo
    ButtonModule, DropDownsModule, DateInputsModule, GridModule, LayoutModule, WindowModule, ChartsModule,
    LabelModule, TextBoxModule, FormFieldModule, NumericTextBoxModule, TreeViewModule,
    //internal
    AdminRoutingModule, MdacaLayoutModule
  ]
})
export class AdminModule { }
