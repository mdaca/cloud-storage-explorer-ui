import {EventEmitter, Injectable, OnDestroy, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {PageChangeEvent} from "@progress/kendo-angular-grid";
import {Validated} from 'src/app/models/interfaces/validated';

@Injectable()
export abstract class EditableGridComponent<T extends Validated> implements OnInit, OnDestroy {

  /** The category for which details are displayed */
  public pendingNewRow: any;
  /** the row index and form group that are being edited (0 and null respectively if it was closed) */
  public editedRowIndex: number = 0;
  public editedFormGroup: any;

  public view: { data: T[], total: number } = {data: [], total: 0};

  public gridState: { skip: number, take: number } = {skip: 0, take: 5};

  protected constructor() {
  }

  //allows for creation of the generic object "T"
  abstract get clazz(): new () => T;

  abstract get gridRecords(): T[];

  abstract get grid(): any;

  abstract get formError(): EventEmitter<string[]>;

  abstract createFormGroup(fieldObject: T): FormGroup;

  public ngOnInit(): void {
    this.updateGrid();
  }

  public ngOnDestroy() {
    // automatically preserve the unsaved row if this grid being navigated away from
    if (this.pendingNewRow) {
      this.saveRow(this.pendingNewRow, 0);
    }
  }

  /**
   * ensures that the model is always updated
   * the onCellClose is not triggered onDestroy, so update the model on keypress instead
   */
  public updateModel() {
    if (!this.editedFormGroup) {
      return;
    }

    let formGroupValue = this.editedFormGroup.value;
    this.gridRecords[this.editedRowIndex] = this.castToObject(formGroupValue);
  }

  public addHandler() {
    this.pendingNewRow = this.createFormGroup(new this.clazz());
    this.grid.addRow(this.pendingNewRow);
    this.updateGrid();
  }

  public cancelHandler() {
    this.pendingNewRow = null;
    //the "new" row is always the first, with a rowId of -1
    this.grid.closeRow(-1);
    this.updateGrid();
  }

  public saveHandler({formGroup, rowIndex}: any) {
    let errorMessages = this.validator(formGroup);
    if (!errorMessages) {
      this.saveRow(formGroup, rowIndex);
    } else {
      this.formError.emit(errorMessages);
    }
  }

  public validator = (formGroup: FormGroup) => {
    let fieldValue = this.castToObject(formGroup.value);

    return fieldValue.validate();
  }

  public saveRow(formGroup: FormGroup, rowIndex: number) {
    let fieldValue = this.castToObject(formGroup.value);

    this.pendingNewRow = null;
    this.gridRecords.unshift(fieldValue);
    this.grid.closeRow(rowIndex);
    this.updateModel();
    this.updateGrid();
  }

  public removeHandler({rowIndex}: any) {
    this.gridRecords.splice(rowIndex, 1);
    this.grid.cancelCell();
    this.updateModel();
    this.updateGrid();
  }

  public cellClickHandler({rowIndex, columnIndex, isEdited}: any) {
    const fieldObject = this.gridRecords[rowIndex];

    if (!isEdited) {
      this.editedRowIndex = rowIndex;
      this.editedFormGroup = this.createFormGroup(fieldObject);
      this.grid.editCell(rowIndex, columnIndex, this.editedFormGroup);
    }
  }

  public cellCloseHandler() {
    this.editedRowIndex = 0;
    this.editedFormGroup = null;
    this.updateModel();
    this.updateGrid();
  }

  public pageChange({skip, take}: PageChangeEvent): void {
    this.gridState.skip = skip;
    this.gridState.take = take;
    this.updateGrid();
  }

  private castToObject(value: T) {
    return Object.assign(new this.clazz(), value);
  }

  public updateGrid(): void {
    let start = this.gridState.skip;
    let end = this.gridState.take + this.gridState.skip;

    this.view = {
      data: this.gridRecords.slice(start, end),
      total: this.gridRecords.length
    };
  }

}
