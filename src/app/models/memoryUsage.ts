import {ByteUtil} from "../utils/ByteUtil";
import {PathProcessor} from "../utils/PathProcessor";
import {Drive} from "./drive";
import {DriveItem} from './driveItem';

export class MemoryUsage {

  usageId: number = 0;
  path: string = "/";
  created: string = "";
  bytes: number = 0;

  constructor() {
  }

  public toString(): string {
    return this.getFileName() + " - " + this.getDisplayBytes();
  }

  /** date as mm/dd/yyyy */
  public getSimpleDate(): string {
    return new Date(this.created).toLocaleDateString();
  }

  /** date as mm/dd/yyyy HH:MM:SS AM/PM */
  public getSimpleDateTime(): string {
    return new Date(this.created).toLocaleString();
  }

  public getFileName(): string {
    return PathProcessor.getFileName(this.path);
  }

  public getDisplayBytes(): string {
    return ByteUtil.getDisplayBytes(this.bytes);
  }

  public toDriveItem(drive: Drive): DriveItem {
    let driveItem = new DriveItem();

    driveItem.path = this.path;
    driveItem.displayName = PathProcessor.getFileName(this.path);
    driveItem.displayPath = drive.displayName + PathProcessor.GUI_SEP + this.path;
    driveItem.driveId = drive.driveId;
    driveItem.fileSize = this.bytes;
    driveItem.directory = PathProcessor.isDirectorySemantically(this.path);

    return driveItem;
  }

}