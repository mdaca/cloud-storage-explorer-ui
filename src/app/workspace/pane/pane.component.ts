import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit} from '@angular/core';
import {DriveService} from '../../services/drive.service';
import {Drive} from '../../models/drive';
import {IDriveItem} from '../../models/idriveItem';
import {DriveItem} from '../../models/driveItem';
import {ErrorEvent, FileInfo, SuccessEvent, UploadEvent} from '@progress/kendo-angular-upload';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {WorkspaceConfig} from 'src/app/models/workspaceConfig';
import {PathProcessor} from "../../utils/PathProcessor";
import {DriveUtil} from "../../utils/DriveUtil";
import {BaseService} from "../../services/base.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-pane',
  templateUrl: './pane.component.html',
  styleUrls: ['./pane.component.scss']
})
export class PaneComponent implements OnInit, AfterViewInit {

  public static selectionEvent = new EventEmitter<{lr: string, driveItem: IDriveItem}>();

 folderPickerOpened = false;
  private pendingUploadItems: Set<string> = new Set<string>();

  constructor(private driveService: DriveService,
              private elRef: ElementRef,
              private formBuilder: FormBuilder) {
    driveService.driveCache.subscribe(drives => { this.drives = drives;});
    this._driveService = driveService;
    this._elRef = elRef;

    // @ts-ignore
    this.selectionEvent.subscribe(({lr, driveItem}) => {
      if (lr != this.lr) {
        return;
      }

      //TODO confirm if we want to preserve current sort and sort direction
      driveItem.sortField = this.currentSort;
      driveItem.isAsc = this.isAsc;

      this.driveItem = driveItem;
      this.refresh();
      this.show = false;
    });
  }

  /**
   * make a getter so that the selection event can be static, and thus accessed outside of PaneComponent
   */
  public get selectionEvent() {
    return PaneComponent.selectionEvent;
  }

  ngAfterViewInit() {
    this.setup508Compliance();
  }

  private setup508Compliance() {
    //adds title to "select files" button in kendoUI file upload
    document.getElementsByName("files").forEach(element => {
      element.title = "Select files";
    });

    //removes the transparency on text "Drop files here to upload" text
    let dropzoneHints = document.getElementsByClassName("k-dropzone-hint");
    for (let i = 0; i < dropzoneHints.length; i++) {

      // @ts-ignore
      dropzoneHints[i].style.opacity = 1;
    }
  }

  _elRef: ElementRef;
  _driveService: DriveService;

  @Input()
  get driveItem(): IDriveItem {
    return this._driveItem;
  }

  set driveItem(item: IDriveItem) {
    let clonedItem = DriveUtil.cloneItem(item);

    this._driveItem = clonedItem;

    if (clonedItem.driveId > 0) {
      let drive = this._driveService.findDrive(clonedItem.driveId);
      this.driveStorageClasses = drive.storageClasses;
      this.driveItem.displayPath = this.driveService.driveItemDisplay(item);
      this.updateChildItems();
    }
    this.updateConfig();
  }

  openedRestore: boolean = false;

  closeRestore() {
    this.openedRestore = false;
  }

  openedBdv: any;

  closeBdv() {
    this.openedBdv = false;
  }

  restoreCommit() {
    this.openedRestore = false;

    let expirationDays = this.form.value.expirationDays;

    //todo condense this into one http call; this currently iterates
    for (let driveItem of this.getSelectedItems()) {
      this.driveService.restore(driveItem, expirationDays);
    }
  }

  closeStorageClass() {
    this.openedStorageClass = false;
  }

  storageClassCommit() {
    this.openedStorageClass = false;

    this.driveService.archive(this.getSelectedItems(), this.selectedStorageClass);
  }

  selectedStorageClass: any = null;


  addToBdvCommit() {
    this.openedBdv = false;

    let tableName = this.form.value.tableName;
    let databaseName = this.form.value.databaseName;

    for (let driveItem of this.getSelectedItems()) {
      this.driveService.addExternalTableReference(driveItem, databaseName, tableName);
    }
  }

  @Input()
  get lr(): string { return this._lr; }
  set lr(item: string) {
    this._lr = item;
  }

  _lr: string = '';

  updateConfig() {
    if (this.driveItem.driveId > 0) {
      if (this._lr == 'l') {
        this._config.leftPath = this.driveItem.path;
        this._config.leftDriveId = this.driveItem.driveId;
        this._config.leftSearchText = this.filterText;
        this._config.leftSortField = this.currentSort;
        this._config.leftSortAsc = this.isAsc;
      } else if (this._lr == 'r') {
        this._config.rightPath = this.driveItem.path;
        this._config.rightDriveId = this.driveItem.driveId;
        this._config.rightSearchText = this.filterText;
        this._config.rightSortField = this.currentSort;
        this._config.rightSortAsc = this.isAsc;
      }
    }
  }

  @Input()
  get config(): WorkspaceConfig { return this._config; }
  set config(config: WorkspaceConfig) {
    if (config.workspaceId != this._config.workspaceId) {
      if (this._lr == 'l') {
        this.filterText = config.leftSearchText;
        this.currentSort = config.leftSortField;
        this.isAsc = config.leftSortAsc;
      } else if (this._lr == 'r') {
        this.filterText = config.rightSearchText;
        this.currentSort = config.rightSortField;
        this.isAsc = config.rightSortAsc;
      }
      this.selectAllFlag = false;
      this.partialSelectAll = false;
      this.driveItem.isAsc = this.isAsc;
      this.driveItem.sortField = this.currentSort;
      this.driveItem.searchText = this.filterText;
      this.sort();
    }
    this._config = config;
  }

  driveStorageClasses: any[] = [];

  _config: WorkspaceConfig = new WorkspaceConfig();

  filterKeyup(e: any) {
    this.updateConfig();
  }

  filterText: string = '';

  public _driveItem: IDriveItem = new Drive();

  cancelPath() {
    this.folderPickerOpened = false;
  }

  transferCommit() {
    let deleteSource = (this.currentAction == "Move");

    this.driveService.transferBatch(this.getSelectedItems(), this.folderPickerItem, deleteSource);

    this.folderPickerOpened = false;
  }

  ngOnInit(): void {
    //if one of the altered drive items is inside the current pane, refresh this pane
    this.driveService.alteredDrives.subscribe((alteredParents: IDriveItem[]) => {
      //tests if one of the altered drives/folders is the current one
      let currentDriveChanged = alteredParents.some(alteredItem => this.driveItem.equals(alteredItem));

      if (currentDriveChanged) {
        this.refresh();
      }
    });
  }
  public drives: Drive[] = [];

  public show: boolean = false;

  public folderPickerItem: IDriveItem = new DriveItem();

  public selectedPickerText: string = '';

  public onToggle(): void {
    this.show = !this.show;
  }

  currentSort: string = 'displayName';
  isAsc: boolean = true;

  sort(field: string = '') {

    if (field != '') {
      let sameFieldIsClicked = this.currentSort == field;

      if (sameFieldIsClicked) {
        this.isAsc = !this.isAsc;
      } else {
        this.currentSort = field;
        this.isAsc = true;
      }
      this.driveItem.isAsc = this.isAsc;
      this.driveItem.sortField = this.currentSort;

      this.updateConfig();
    }

    this.driveItem.sortItems();
  }

  /**
   * moves the modal inside the pane after dragging it if it is outside the pane
   */
  public onEndDrag() {
    return;
    let kendoPaneElement = this._elRef.nativeElement.offsetParent;
    let kendoWindow = document.getElementsByTagName("kendo-window")[0];

    const windowWidth = kendoPaneElement.offsetWidth;
    const windowHeight = kendoPaneElement.offsetHeight;

    let height = kendoWindow.scrollHeight;
    let width = kendoWindow.scrollWidth;

    let maxLeft = windowWidth - width - this.offset;
    let maxHeight = windowHeight - height - this.offset;

    //too high up
    if (this.top < this.offset) {
      this.top = this.offset;
    }
    //too far down
    if (this.top > maxHeight) {
      this.top = maxHeight;
    }
    //too far left
    if (this.left < this.offset) {
      this.left = this.offset;
    }
    //too far right
    if (this.left > maxLeft) {
      this.left = maxLeft;
    }

  }

  openCreateDirectory() {
    this.form = this.formBuilder.group({'folderName': ['', [this.fileNameValidator]]});

    this.openedFolder = true;
  }

  folderCommit() {
    let folderName = this.form.value.folderName;

    let driveItem = new DriveItem();
    driveItem.driveId = this.driveItem.driveId;
    driveItem.path = PathProcessor.addLastSlash(this.driveItem.path) + folderName;
    driveItem.displayName = folderName;

    this.driveService.mkdir(driveItem);
    this.openedFolder = false;
  }

  public offset = 50;
  public left = this.offset;
  public top = this.offset;

  itemChanged(selectedItem: IDriveItem, isUpDir: boolean): void {
    if (isUpDir) {
      selectedItem.path = PathProcessor.getParentFolderPath(selectedItem.path);
    }
    selectedItem.sortField = this.currentSort;
    selectedItem.isAsc = this.isAsc;

    this.driveItem = selectedItem;
    this.refresh();
    this.selectAllChange();
  }

  public fileNameAlreadyExists: boolean = false;
  public isSameFileLocation: boolean = false;
  public validatingFolderPicker: boolean = false;

  public handlePickerSelection(destFolderItem: IDriveItem): void {

    this.selectedPickerText = destFolderItem.displayPath;
    this.folderPickerItem = destFolderItem;

    //before knowing the new location is unused, prevent the user from moving the file
    this.validatingFolderPicker = true;
    this.fileNameAlreadyExists = false;
    this.isSameFileLocation = false;

    let items = this.getSelectedItems();
    let newItems: DriveItem[] = [];

    for (let i = 0; i < items.length; i++) {
      let oldDriveItem = items[i];
      let newDriveItem = new DriveItem();

      newDriveItem.path = destFolderItem.path + oldDriveItem.displayName;
      newDriveItem.driveId = destFolderItem.driveId;

      this.isSameFileLocation = (oldDriveItem.driveId == newDriveItem.driveId) &&
        newDriveItem.path.startsWith(oldDriveItem.path);

      newItems.push(newDriveItem);

      if (this.isSameFileLocation) {
        this.validatingFolderPicker = false;
        break;
      }
    }

    //if no errors have been found so far, keep looking
    if (this.validatingFolderPicker) {
      this.driveService.anyExists(newItems).subscribe(anyExists => {
        this.fileNameAlreadyExists = !!anyExists;

        this.validatingFolderPicker = false;
      });
    }
  }

  openedStorageClass: boolean = false;
  currentAction: string = '';

  public form: FormGroup = new FormGroup({});

  itemEventSelected(commandText: string): void {
    this.currentAction = commandText;
    let drive = this.driveService.findDrive(this.driveItem.driveId);
    let items = this.getSelectedItems();

    switch (commandText) {
      case "Download":
        this.driveService.downloadFile(items[0]);
        break;
      case "Preview":
        this.driveService.downloadFile(items[0], 100, 100);
        break;
      case "Restore":
        if (drive.requiresDaysToExpire) {
          this.form = this.formBuilder.group({'expirationDays': [0, Validators.required]});
          this.openedRestore = true;
        } else {
          this.restoreCommit();
        }
        break;
      case "Storage Class":
        this.selectedStorageClass = null;
        this.openedStorageClass = true;
        break;
      case "Delete":
        this.openedDelete = true;
        break;
      case "Extract":
        let checkedItems = this.getSelectedItems();
        let extractedItems = checkedItems
          .filter(item => this.driveItem.isAlreadyExtracted(item.path));

        if (extractedItems.length) {
          this.openedExtract = true;
        } else {
          for (let driveItem of items) {
            this.driveService.extractFile(driveItem);
          }
        }
        break;
      case "Rename":
        this.form = this.formBuilder.group({'fileName': ['', [this.fileNameValidator]]});
        this.openedRename = true;
        break;
      case "Move":
      case "Copy":
        this.selectedPickerText = "";
        this.folderPickerItem = new DriveItem();

        setTimeout(function () {
          PaneComponent.moveFooterAndHeadInFolderPickerModal();
        }, 1);

        this.folderPickerOpened = true;
        break;
      case 'Add To BDV':
        this.openedBdv = true;

        this.form = this.formBuilder.group({
          'databaseName': ['', Validators.required],
          'tableName': ['', Validators.required]
        });
        break;

    }
  }

  /**
   * moves the "select a folder" and "button footer" elements outside of the modal content
   * this enables the scrollbar to ONLY apply to the treeview
   */
  private static moveFooterAndHeadInFolderPickerModal() {
    let modal = document.getElementsByTagName("kendo-window")[0];
    let modalContents = modal.getElementsByClassName("k-content")[0];

    let selectedFolderNode = document.getElementsByClassName("picker-selected-folder")[0];
    let footerNode = document.getElementsByClassName("folder-picker-footer")[0];

    modal.insertBefore(selectedFolderNode, modalContents);
    modal.insertBefore(footerNode, modalContents.nextSibling);
  }

  public getSelectedItems(): DriveItem[] {
    return this._driveItem.getSelectedItems(this.filterText);
  }

  public uploadSaveUrl = BaseService.rootUrl + 'drives/upload/chunk';

  public uploadFiles: Array<FileInfo> = new Array<FileInfo>();

  openedFolder: boolean = false;

  closeFolder() {
    this.openedFolder = false;
  }

  public errorEventHandler(e: ErrorEvent): void {
    this.pendingUploadItems.delete(e.files[0].name);

    let displayPath = this.driveService.driveItemDisplay(this.driveItem);

    for (const item of e.files) {
      this._driveService.addMessages(['Problem uploading file: ' + displayPath + item.name]);
    }
  }

  public successEventHandler(e: SuccessEvent): void {
    this.refresh();
    let file = e.files[0];

    this.pendingUploadItems.delete(file.name);

    let displayPath = PathProcessor.addLastSlash(this._driveService.driveItemDisplay(this._driveItem)) + file.name;

    this._driveService.addMessages(['Uploaded file: ' + displayPath]);

    setTimeout(() => {
      this.uploadFiles = this.uploadFiles.filter(fileInfo => fileInfo.name != file.name);
    }, 5000);
  }

  public uploadEventHandler(e: UploadEvent): void {
    e.data = {
      'driveId': this.driveItem.driveId,
      'path': this.driveItem.path
    };

    for (const item of e.files) {

      let fileName = item.name;

      if (this.driveItem.fileNameExists(fileName)) {
        this._driveService.addMessages(['Upload failed, file already exists: ' + fileName]);
        e.preventDefault();
        continue;
      }

      //use the special endpoint for empty files
      if (item.size == 0) {
        let driveItem = new DriveItem();
        driveItem.driveId = this.driveItem.driveId;
        driveItem.path = PathProcessor.addLastSlash(this.driveItem.path) + fileName;

        this.driveService.uploadEmptyFile(driveItem);
        e.preventDefault();
      }

      if (!this.pendingUploadItems.has(fileName)) {
        let displayPath = this.driveService.driveItemDisplay(this.driveItem);

        this.pendingUploadItems.add(fileName);
        this._driveService.addMessages(['Uploading file: ' + PathProcessor.addLastSlash(displayPath) + fileName]);
      }
    }

  }

  public fileNameValidator = (formControl: FormControl) => {
    let fileName = formControl.value;

    return this.newFileNameIsValid(fileName) ? null : {'isInvalid': true};
  }

  public fetchChildren = (item: any) => this._driveService.getFolders(item);

  public hasChildren(node: any): boolean {
    return node.directory;
  }

  drop(event: CdkDragDrop<DriveItem[]>) {
    //represents the source of the item being copied
    let sourceItem: DriveItem = event.item.data;
    //represents the destination of the item being copied
    let destItem = this.driveItem;

    if (destItem && destItem.driveId > 0) {

      let itemPath = sourceItem.path;

      if (sourceItem.restoring) {
        this._driveService.addMessages(["Move is not a valid action for data files that are being restored; please wait till the file has been restored successfully."]);
      } else if (sourceItem.isRestored()) {
        this._driveService.addMessages(["File is now restored. Right click on file to view available options for restored files."]);
      } else if (sourceItem.isArchived()) {
        this._driveService.addMessages(["Move is not valid for archived data files. Right click and select \"Restore\" to access the restored file."]);
      } else if (destItem.fileNameExists(itemPath)) {
        this._driveService.addMessages(["Error: unable to move file or folder because another item with the same name already exists."]);
      } else {
        this._driveService.transfer(sourceItem, destItem, false);
      }
    }
  }

  openedDelete: boolean = false;

  closeDelete() {
    this.openedDelete = false;
  }

  openedExtract: boolean = false;

  closeExtract() {
    this.openedExtract = false;
  }

  deleteCommit() {
    this.openedDelete = false;

    this.driveService.delete(this.getSelectedItems());
  }

  openedRename: boolean = false;

  closeRename() {
    this.openedRename = false;
  }

  renameCommit() {
    let fileName = this.form.value.fileName;

    if (!this.newFileNameIsValid(fileName)) {
      return;
    }

    let driveItem = this.getSelectedItems()[0];
    let newPath = PathProcessor.getParentFolderPath(driveItem.path) + fileName;
    newPath = PathProcessor.removeFirstSlash(newPath);

    if (driveItem.directory) {
      newPath = PathProcessor.addLastSlash(newPath);
    }

    this.driveService.rename(driveItem, newPath);

    this.openedRename = false;
  }

  refresh() {
    this.updateChildItems();
    this.partialSelectAll = false;
    this.selectAllFlag = false;
    this.filterText = "";
    this.updateConfig();
  }

  private updateChildItems() {
    this.driveService.updateChildItems(this._driveItem).subscribe(items =>{});
  }

  public containsSlashes(fileName: string): boolean {
    return /[\\|\/]/.test(fileName);
  }

  public isEmpty(fileName: string): boolean {
    return !fileName || !fileName.trim();
  }

  /**
   * new file name cannot contain slashes (either '/' or '\')
   */
  newFileNameIsValid(fileName: string) {

    let empty = this.isEmpty(fileName);
    let containsSlashes = this.containsSlashes(fileName);
    let exists = this.driveItem.fileNameExists(fileName);

    return !empty && !containsSlashes && !exists;
  }

  partialSelectAll: boolean = false;
  selectAllFlag: boolean = false;

  selectAllChange() {
    this.driveItem.items
      .filter(item => !item.directory)
      .forEach(item => {
        item.checked = this.selectAllFlag && !item.hidden;
      });
    this.checkboxToggled();
  }

  checkboxToggled() {
    let hasCheckedFile = false;
    let hasUncheckedFile = false;
    for (let item of this.driveItem.items) {
      if (!item.directory) {
        hasCheckedFile = hasCheckedFile || item.checked;
        hasUncheckedFile = hasUncheckedFile || !item.checked;

        if (hasCheckedFile && hasUncheckedFile) {
          break;
        }
      }
    }

    this.partialSelectAll = hasCheckedFile && hasUncheckedFile;
    this.selectAllFlag = hasCheckedFile && !hasUncheckedFile;
  }

}
