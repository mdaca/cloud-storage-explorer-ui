import {Component, EventEmitter, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SortDescriptor} from "@progress/kendo-data-query";
import {ConfirmChangesComponent} from "../../interfaces/confirm-changes.interface";
import {Drive} from "../../models/drive";
import {DriveSecurityRule} from "../../models/driveSecurityRule";
import {DriveUser} from "../../models/driveUser";
import {AdminService} from "../../services/admin.service";
import {DriveService} from "../../services/drive.service";
import {DriveUtil} from "../../utils/DriveUtil";
import {DriveConfigurationService} from "./drive.configuration.service";
import {EditableGridComponent} from "./editable-grid.component";

@Component({
  selector: 'drive-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent extends EditableGridComponent<Drive> implements OnInit, ConfirmChangesComponent {

  //drives displayed in the grid
  public gridRecords: Array<Drive> = [];
  public isAdmin: boolean = false;
  public driveTypes: any[] = DriveUtil.driveTypes;
  public expandedDetailKeys: any[] = [];

  public errorMessages: string[] = [];
  public errorModalOpened: boolean = false;
  public formError: EventEmitter<string[]> = new EventEmitter<string[]>();

  @ViewChild("gridComponent")
  public grid: any;
  public gridState: { skip: number, take: number } = {skip: 0, take: 10};
  public sort: SortDescriptor[] = [{
    "dir": "asc",
    "field": "driveId"
  }];
  public clazz = Drive;

  constructor(public configService: DriveConfigurationService,
              public adminService: AdminService,
              public driveService: DriveService,
              private formBuilder: FormBuilder) {
    super();

    this.formError.subscribe((message: string[]) => {
      this.showErrors(message);
    });
  }

  //Override
  public ngOnInit(): void {
    this.hardRefresh();

    this.driveService.getUserInfo().subscribe(resp => {
      this.isAdmin = resp.admin;
    });
  }

  private hardRefresh() {
    this.driveService.getDrives(true)
      .subscribe(drives => {
        this.gridRecords = drives;
        this.updateGrid();
      });
    this.configService.reset();
  }

  //START methods for ConfirmChangesComponent

  public isSaved(): boolean {
    let drives = this.gridRecords;

    let hasUnsavedChanges = drives.some(drive => !!drive.unsavedChanges.size);
    let hasUnsavedDrive = !!this.pendingNewRow;
    let hasChanges = this.configService.hasChanges();

    return !hasUnsavedChanges && !hasUnsavedDrive && !hasChanges;
  }

  public isValid(): boolean {
    let hasErrors = this.buildErrorMessages().length;

    return !hasErrors;
  }

  public save(): void {
    this.configService.saveChanges()
      .toPromise()
      .then(() => {
        this.hardRefresh();
      });
  }

  public showErrorModal() {
    this.errorMessages = this.buildErrorMessages();
    this.toggleErrorModal(true);
  }

  //END methods for ConfirmChangesComponent

  sortChange(sort: SortDescriptor[]) {
    this.sort = sort;

    this.updateGrid();
  }

  public validatedSave() {
    this.updateModel();

    if (this.isValid()) {
      this.save();
    } else {
      this.showErrorModal();
    }
  }

  //Override
  public updateModel() {
    super.updateModel();

    if (!this.editedFormGroup) {
      return;
    }
    let drive = DriveUtil.cloneDrive(this.editedFormGroup.value);
    if (drive.driveId) {
      this.configService.update(drive);
    } else {
      this.configService.create(drive);
    }
  }

  //Override
  public saveRow(formGroup: FormGroup, rowIndex: number) {
    let drive = DriveUtil.cloneDrive(formGroup.value);
    this.configService.create(drive);

    super.saveRow(formGroup, rowIndex);
  }

  public buildErrorMessages() {
    let messages: string[] = [];

    if (this.pendingNewRow) {
      messages.push(...["A new drive is not yet saved", " - click 'Add' and 'Save Changes' to save it"]);
    }

    for (let drive of this.gridRecords) {
      let unsavedProperties = drive.unsavedChanges;

      if (!unsavedProperties) {
        continue;
      }

      if (unsavedProperties.has(DriveSecurityRule.name)) {
        messages.push("Drive '" + drive.displayName + "' has an unsaved security rule");
      }

      if (unsavedProperties.has(DriveUser.name)) {
        messages.push("Drive '" + drive.displayName + "' has an unsaved drive admin");

      }

      let errorMessages = drive.validateFull();
      if (errorMessages) {
        messages.push(...errorMessages);
      }
    }

    return messages;
  }

  public cancelChanges(): void {
    this.cancelHandler();

    this.hardRefresh();
    this.expandedDetailKeys.length = 0;
  }

  public expandDetailsBy = (drive: Drive): number => {
    return drive.driveId;
  };

  public createFormGroup(drive: Drive): FormGroup {
    return this.formBuilder.group({
      'driveId': drive.driveId,
      'displayName': [drive.displayName, Validators.required],
      'driveType': [drive.driveType]
    });
  }

  public getDriveTypeText(driveType: string) {
    return DriveUtil.getDriveTypeText(driveType);
  }

  public testConnection(drive: Drive) {

    //this prevents the de-serialization of Drive to break the Java code
    // (the properties of drive in the drive.ts file must match the fields in Drive.java)
    // @ts-ignore
    delete drive.connectionStatus;
    this.adminService.testConnection(drive).subscribe(connectionSuccess => {
      drive.connectionStatus = connectionSuccess ? "SUCCESS" : "FAILURE";
    });

  }

  public updateGrid(): void {
    this.gridRecords = DriveUtil.sortDrives(this.gridRecords, this.sort);
    super.updateGrid();
  }

  public toggleErrorModal(opened: boolean) {
    this.errorModalOpened = opened;
  }

  public showErrors(messages: any) {
    this.errorMessages = messages;
    this.toggleErrorModal(true);
  }

}
