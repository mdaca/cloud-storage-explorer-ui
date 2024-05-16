import {DriveItem} from "./driveItem";
import {PathProcessor} from "../utils/PathProcessor";

export abstract class IDriveItem {

  displayName: string = "";
  path: string = "";
  items: DriveItem[] = [];
  driveId: number = 0;
  directory: boolean = false;
  displayPath: string = "";
  sortField: string = "";
  isAsc: boolean = false;
  searchText: string = "";
  accessLevels: string[] = [];
  loading: boolean = false;

  protected constructor() {
  }
  
  public itemCount(filterText: string): number {
    return this.items.filter(x => x.directory == false  && x.isFilterApplicable(filterText)).length;
  }
  
  public checkedCount(filterText: string): number {
    return this.items.filter(x => x.checked == true  && x.isFilterApplicable(filterText)).length;
  }

  public folderCount(filterText: string): number {
    return this.items.filter(x => x.directory == true  && x.isFilterApplicable(filterText)).length;
  }

  /** returns the class name for a kendo icon, depending on the drive item type */
  abstract getIconClass(): string;

  equals(o: any) {
    if (!(o instanceof IDriveItem)) {
      return false;
    }

    if (!(this.driveId && o.driveId)) {
      return false;
    }

    return (this.driveId == o.driveId) && ((this.path == o.path) ||
        (PathProcessor.isRoot(this.path) && PathProcessor.isRoot(o.path)));
  }

  /** return true IFF this item has a drive id */
  public isValid(): boolean {
    return !!this.driveId;
  }

  public getFileName(): string {
    return PathProcessor.getFileName(this.path);
  }

  /**
   * the item is considered selected if it is already checked AND applies to the filter (if a filter exists)
   * @param filterText
   * @private
   */
  public getSelectedItems(filterText: string): DriveItem[] {
    return this.items.filter(driveItem =>
      driveItem.checked && driveItem.isFilterApplicable(filterText)
    );
  }

  public fileNameExists(path: string): boolean {
    let searchPath = PathProcessor.getFileName(path);

    return this.items.some(item => (searchPath == PathProcessor.getFileName(item.path)));
  }

  public pathExists(path: string): boolean {
    return this.items.some(item => (path == item.path));
  }

  public isAlreadyExtracted(name: string): boolean {
    let extractedPath = name.substring(0, name.lastIndexOf("."));

    let dirExtractedPath = extractedPath + "/";
    return this.pathExists(extractedPath) || this.pathExists(dirExtractedPath);
  }

  public sortItems() {
    let sortField = this.sortField;
    let asc = this.isAsc;

    this.items = [...this.items.sort((a: DriveItem, b: DriveItem) => {

      let compare = 0;

      if (sortField === 'storageClass') {
        let aVal = !a.directory && a.storageClass && a.storageClass.displayText ?
          a.storageClass.displayText : "";
        let bVal = !b.directory && b.storageClass && b.storageClass.displayText ?
          b.storageClass.displayText : "";

        compare = asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortField === 'fileSize') {
        let aVal = a.directory ? -1 : a.fileSize;
        let bVal = b.directory ? -1 : b.fileSize;

        compare = asc ? (aVal - bVal) : (bVal - aVal);
      } else if (sortField === 'modifiedDate') {
        let aVal = a.directory ? "0" : a.modifiedDate + "";
        let bVal = b.directory ? "0" : b.modifiedDate + "";

        compare = asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (!compare || sortField == 'displayName') {
        let aVal = a.displayName;
        let bVal = b.displayName;

        compare = asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return compare;
    })];
  }

}
