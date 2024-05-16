import {ByteUtil} from "../utils/ByteUtil";
import {IDriveItem} from './idriveItem';
import {PathProcessor} from "../utils/PathProcessor";
import {Drive} from "./drive";

export class DriveItem extends IDriveItem {

  displayName: string = '';
  path: string = '';
  items: DriveItem[] = [];
  driveId: number = 0;
  directory: boolean = false;
  modifiedDate: number = 0;
  fileSize: number = 0;
  displayPath: string = '';
  sortField: string = '';
  isAsc: boolean = true;
  searchText: string = '';
  storageClass: any = null;
  accessLevels: string[] = [];
  restoring: boolean = false;
  checked: boolean = false;
  restoreExpireDate: string = '';
  loading: boolean = false;
  hidden: boolean = false;

  constructor() {
    super();
  }

  public toString() {
    return this.displayPath;
  }

  public getIconClass(): string {
    let iconClass = "k-icon ";

    if (this.directory) {
      iconClass += "k-i-folder"
    } else if (this.isExtractableType()) {
      iconClass += "k-i-file-zip k-i-zip";
    } else if (this.isBdvFile()) {
      iconClass += "k-i-data";
    } else {//use Google's icon set instead
      return "material-icons";
    }

    return iconClass;
  }

  /** ex returns: "myFolder - 18 GB" */
  public getFileSizeDisplay() {
    return this.getFileName() + " - " + this.getDisplayBytes();
  }

  public isBdvFile() {
    return PathProcessor.isBdvFile(this.displayName);
  }

  public isExtractableType() {
    return PathProcessor.isExtractableType(this.displayName);
  }

  public isArchived() {
    return this.storageClass && this.storageClass.restoreRequired;
  }

  /**
   * if this drive item has restoreExpireDate set, it is temporarily restored
   */
  public isRestored() {
    return !!this.restoreExpireDate;
  }

  public getDisplayBytes() {
    return ByteUtil.getDisplayBytes(this.fileSize);
  }

  getParentItem(): IDriveItem {
    let parentFolderPath = this.getParentFolderPath();
    let parentIsDrive = PathProcessor.isRoot(parentFolderPath);
    let parentFolderDisplayPath = PathProcessor.getParentFolderPath(this.displayPath);
    //the display name for drives is stored in the displayPath; the display name for folders is stored in the path
    let displayName = PathProcessor.getFileName(parentIsDrive ? parentFolderDisplayPath : parentFolderPath);

    let parentItem = parentIsDrive ? new Drive() : new DriveItem();
    parentItem.driveId = this.driveId;
    parentItem.path = parentFolderPath;
    parentItem.displayName = displayName;
    parentItem.displayPath = parentFolderDisplayPath;
    parentItem.directory = true;

    return parentItem;
  }

  public getParentFolderPath(): string {
    return PathProcessor.getParentFolderPath(this.path);
  }

  /**
   * return true iff the filter text is included in the displayName of the driveItem
   * note: if this method returns false, this driveItem should be hidden and actions should not apply to it
   */
  isFilterApplicable(filterText: string): boolean {
    //if no filter is applied, always show this item
    if (!filterText) {
      return true;
    }
    let displayName = this.displayName.toLowerCase();
    filterText = filterText.toLowerCase();

    return displayName.includes(filterText);
  }

}
