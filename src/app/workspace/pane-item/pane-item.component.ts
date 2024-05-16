import {AfterViewInit, Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DriveItem} from '../../models/driveItem';
import {DriveService} from '../../services/drive.service';
import {ContextMenuComponent, ContextMenuPopupEvent, ContextMenuSelectEvent} from '@progress/kendo-angular-menu';
import {IDriveItem} from "../../models/idriveItem";

@Component({
  selector: 'app-pane-item',
  templateUrl: './pane-item.component.html',
  styleUrls: ['./pane-item.component.scss']
})
export class PaneItemComponent implements OnInit, AfterViewInit {

  @ViewChild('menu') menu: ContextMenuComponent | undefined;
  @Input('parent')
  public parent: IDriveItem = new DriveItem();

  _driveService: DriveService;

  @Input()
  disabled: boolean = false;

  constructor(driveService: DriveService) {
    this._driveService = driveService;
  }

  ngOnInit(): void {
    this.driveItem.checked = false;
  }

  ngAfterViewInit(): void {
    this.setup508Compliance();
  }

  private setup508Compliance() {
    let checkBoxes = document.querySelectorAll("input[type='checkbox']");

    checkBoxes.forEach(checkbox => {
      checkbox.setAttribute("aria-label", "checkbox");
    });
  }

  public onPopupOpen(e: ContextMenuPopupEvent): void {
    this.setContextualItems();
  }

  setContextualItems() {
    if (this.disabled) {
      return;
    }

    //if this drive item is right-clicked and not checked, uncheck all other items and check only this item
    if (!this.driveItem.checked) {
      this.parent.items.forEach(item => item.checked = false);

      this.driveItem.checked = true;

      this.checkboxToggled.emit();
    }

    let checkedDriveItems = this.getSelectedItems();

    let allDropdownButtons = this.buildDropdownByDriveItem(this.driveItem);

    //remove button Rename, Preview, and Download from multiselect
    if (checkedDriveItems.length > 1) {
      allDropdownButtons = allDropdownButtons.filter(button => !button.text.match("Download|Preview|Rename"));
    }

    checkedDriveItems.forEach(driveItem => {
      let itemDropdown = this.buildDropdownByDriveItem(driveItem);

      //include only buttons in BOTH drive items (and thus only buttons in ALL the checked drive items)
      allDropdownButtons = allDropdownButtons.filter(button => itemDropdown.includes(button));
    });

    this.dropdownButtons = allDropdownButtons;
  }

  public getSelectedItems() {
    return this.parent.getSelectedItems(this.filterText);
  }

  private buildDropdownByDriveItem(driveItem: DriveItem) {
    let dropdownButtons: Set<any>;

    if (driveItem.restoring) {
      dropdownButtons = new Set(this.RESTORING_DROPDOWN);
    } else if (driveItem.isRestored()) {
      dropdownButtons = new Set(this.RESTORED_DROPDOWN);

      this.addBdvButtonIfApplicable(driveItem, dropdownButtons);
      this.addExtractButtonIfApplicable(driveItem, dropdownButtons);
    } else if (driveItem.isArchived()) {
      dropdownButtons = new Set(this.ARCHIVE_DROPDOWN);
    } else if (driveItem.directory) {
      dropdownButtons = new Set(this.FOLDER_DROPDOWN);
    } else {
      dropdownButtons = new Set(this.ITEMS_DROPDOWN);

      this.addBdvButtonIfApplicable(driveItem, dropdownButtons);
      this.addExtractButtonIfApplicable(driveItem, dropdownButtons);
      this.addStorageClassButtonIfApplicable(driveItem, dropdownButtons);
    }

    //filter to only include buttons included in this drive item's access levels
    return Array.from(dropdownButtons)
      .filter(button => driveItem.accessLevels.includes(button.accessLevel));
  }

  private addBdvButtonIfApplicable(driveItem: DriveItem, dropdownButtons: Set<any>) {
    let drive = this._driveService.findDrive(driveItem.driveId);

    if (drive.isCloudProvider() && drive.hasHiveProperties() && driveItem.isBdvFile()) {
      dropdownButtons.add(this.addToBdvButton);
    }
  }

  private addStorageClassButtonIfApplicable(driveItem: DriveItem, dropdownButtons: Set<any>) {
    let isNotArchived = driveItem.storageClass && !driveItem.storageClass.restoreRequired;

    if (isNotArchived) {
      dropdownButtons.add(this.storageClassButton);
    }
  }

  private addExtractButtonIfApplicable(driveItem: DriveItem, dropdownButtons: Set<any>) {
    if (driveItem.isExtractableType()) {
      dropdownButtons.add(this.extractButton);
    }
  }

  doubleClick() {
    if (this.disabled) {
      return;
    }

    if (this.upDirItem) {
      this.driveSelected.emit(this.parent);
    } if (this.driveItem.directory) {
      this.driveSelected.emit(this.driveItem);
    } else {
      let buttons = this.buildDropdownByDriveItem(this.driveItem);
      if (buttons && buttons.includes(this.downloadButton)) {
        this._driveService.downloadFile(this.driveItem);
      }
    }
  }

  selectEventHandler(e: ContextMenuSelectEvent) {
    let commandText = e.item.text;

    this.itemEventSelected.emit(commandText);
  }

  @Input() upDirItem: boolean = false;

  @Input() driveItem: DriveItem = new DriveItem();

  @Output() driveSelected = new EventEmitter<IDriveItem>();
  @Output() checkboxToggled = new EventEmitter<void>();
  @Output() itemEventSelected = new EventEmitter<string>();

  dropdownButtons: any[] = [];

  @HostListener('document:click')
  clickout() {
    if (this.menu) {
      this.menu.hide();
    }
  }

  private wasInsideCtx = false;

  @HostListener('contextmenu')
  clickInsideCtx() {
    this.wasInsideCtx = true;
  }

  @HostListener('document:contextmenu')
  clickoutCtx() {
    if (!this.wasInsideCtx) {
      if(this.menu) {
        this.menu.hide();
      }
    }
    this.wasInsideCtx = false;
  }

  @Input()
  get filterText(): string { return this._filterText; }
  set filterText(filterText: string) {

    this.driveItem.hidden = !this.driveItem.isFilterApplicable(filterText);

    this._filterText = filterText;
  }
  private _filterText: string =  '';

  private deleteButton = {text: 'Delete', accessLevel: 'Delete'};
  private restoreButton = {text: 'Restore', accessLevel: 'Restore'};
  private renameButton = {text: 'Rename', accessLevel: 'Delete'};
  private moveButton = {text: 'Move', accessLevel: 'Delete'};
  private copyButton = {text: 'Copy', accessLevel: 'Read'};
  private downloadButton = {text: 'Download', accessLevel: 'Read'};
  private previewButton = {text: 'Preview', accessLevel: 'Read'};
  private extractButton = {text: 'Extract', accessLevel: 'Modify'};
  private storageClassButton = {text: 'Storage Class', accessLevel: 'Archive'};
  private addToBdvButton = {text: 'Add To BDV', accessLevel: 'Read'};

  ITEMS_DROPDOWN = [
    this.previewButton,
    this.downloadButton,
    this.copyButton,
    this.moveButton,
    this.renameButton,
    this.deleteButton
  ];

  FOLDER_DROPDOWN = [
    this.copyButton,
    this.moveButton,
    this.renameButton,
    this.deleteButton
  ];

  ARCHIVE_DROPDOWN = [
    this.restoreButton,
    this.deleteButton
  ];

  RESTORING_DROPDOWN = [
    this.deleteButton
  ];

  private RESTORED_DROPDOWN = [
    this.previewButton,
    this.downloadButton,
    this.copyButton,
    this.deleteButton
  ];

  getStorageClassDisplay() {
    if (this.upDirItem || this.driveItem.directory) {
      return "-";
    }

    if (this.driveItem.restoring) {
      return "Restoring";
    }

    if (this.driveItem.isRestored()) {
      return this.driveItem.restoreExpireDate;
    }

    if (this.driveItem.storageClass) {
      return this.driveItem.storageClass.displayText;
    }

    return "-";
  }

  getStorageClassTitle():string {
    if (this.upDirItem) {
      return "Double-click to navigate up a level";
    }

    if (this.driveItem.storageClass) {
      if (this.driveItem.isRestored()) {
        return "File restored from " + this.driveItem.storageClass.displayText + "; restore will expire on " + this.driveItem.restoreExpireDate;
      }

      return this.driveItem.storageClass.displayText;
    }

    return "";
  }

  getClass() {
    if (this.driveItem.hidden)
      return "hidden";

    //if it has a restore expire date, then it is temporarily restored
    if (this.driveItem.isRestored()) {
      return "";
    }

    if (this.driveItem.isArchived()) {
      return "archived";
    }

    return "";
  }
}
