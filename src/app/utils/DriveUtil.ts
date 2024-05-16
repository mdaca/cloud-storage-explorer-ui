import {SortDescriptor} from "@progress/kendo-data-query";
import {ActionAudit} from "../models/actionAudit";
import {Drive} from "../models/drive";
import {DriveItem} from "../models/driveItem";
import {IDriveItem} from "../models/idriveItem";

export class DriveUtil {

  public static driveTypes: any[] = [
    {text: 'Azure Blob Storage', value: 'Blob'},
    {text: 'Google Cloud Storage', value: 'GCS'},
    {text: 'AWS S3', value: 'S3'},
    {text: 'SMB', value: 'SMB'},
    {text: 'Local Drive', value: 'Windows'}
  ];

  static cloneItem(item: IDriveItem): IDriveItem {
    if (item instanceof Drive) {
      return this.cloneDrive(item);
    } else if (item instanceof DriveItem) {
      return this.cloneDriveItem(item);
    } else {
      return new DriveItem();
    }
  }

  static cloneDrive(item: Drive): Drive {
    return Object.assign(new Drive(), item);
  }

  static cloneDriveItem(item: DriveItem): DriveItem {
    return Object.assign(new DriveItem(), item);
  }

  /**
   * builds a list that more closely matches the java layer DriveItem object
   * this allows for accurate serialization from UI -> Java
   */
  static buildSimpleDriveItems(driveItems: DriveItem[]) {
    return driveItems.map(item => {
      return {
        driveId: item.driveId,
        path: item.path,
        storageClass: item.storageClass
      }
    });

  }

  static buildActionAudit(action: string, driveItem: DriveItem, isStart: boolean): ActionAudit {
    let drive = new Drive();
    drive.driveId = driveItem.driveId;

    let audit = new ActionAudit();
    audit.action = action;
    audit.drive = drive;
    audit.oldStorageClass = driveItem.storageClass ? driveItem.storageClass.displayText : {};
    audit.path = driveItem.path;
    if (isStart) {
      audit.created = new Date();
    } else {
      audit.updated = new Date();
    }
    return audit;
  }

  static buildActionAudits(action: string, driveItems: DriveItem[], isStart: boolean): Array<ActionAudit> {
    let audits = new Array<ActionAudit>();
    for (let item of driveItems) {
      audits.push(this.buildActionAudit(action, item, isStart))
    }

    return audits;
  }

  static sortDrives(drives: Drive[], sort?: SortDescriptor[]): Drive[] {
    sort = sort || [{dir: "asc", field: "driveId"}];

    let isAsc = sort[0].dir == "asc";
    let sortField = sort[0].field;

    return drives.sort((a: Drive, b: Drive) => {

      if (sortField == "driveType") {
        let valueA = this.getDriveTypeText(a.driveType);
        let valueB = this.getDriveTypeText(b.driveType);

        return isAsc ? valueA.localeCompare(valueB) : (valueB).localeCompare(valueA);
      } else if (sortField == "driveId") {
        let valueA = a.driveId;
        let valueB = b.driveId;

        return isAsc ? (valueA - valueB) : (valueB - valueA);
      } else {
        // @ts-ignore
        let valueA = "" + a[sortField];
        // @ts-ignore
        let valueB = "" + b[sortField];
        return isAsc ? valueA.localeCompare(valueB) : (valueB).localeCompare(valueA);
      }

    });
  }

  public static getDriveTypeText(driveTypeValue: string) {
    let driveType = this.driveTypes.find(aDriveType => aDriveType.value == driveTypeValue);
    return driveType ? driveType.text : "";
  }

}
