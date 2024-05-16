import {Injectable} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {Drive} from "../../../models/drive";
import {Validated} from "../../../models/interfaces/validated";
import {DriveConfigurationService} from "../drive.configuration.service";
import {EditableGridComponent} from "../editable-grid.component";

@Injectable()
export abstract class DriveConfigSubtabComponent<T extends Validated> extends EditableGridComponent<T> {

  public abstract get drive(): Drive;

  protected constructor(public configService: DriveConfigurationService) {
    super();
  }

  public updateModel() {
    super.updateModel();

    this.configService.update(this.drive);
  }

  public addHandler() {
    this.addPendingChangesClass();

    super.addHandler();
  }

  public saveRow(formGroup: FormGroup, rowIndex: number) {
    this.removePendingChangesClass();

    super.saveRow(formGroup, rowIndex);
  }

  public cancelHandler() {
    this.removePendingChangesClass();

    super.cancelHandler();
  }

  public saveHandler({formGroup, rowIndex}: any) {
    this.removePendingChangesClass();

    super.saveHandler({formGroup, rowIndex});
  }

  private addPendingChangesClass() {
    this.drive.unsavedChanges.add(this.clazz.name);
  }

  private removePendingChangesClass() {
    this.drive.unsavedChanges.delete(this.clazz.name);
  }

}
