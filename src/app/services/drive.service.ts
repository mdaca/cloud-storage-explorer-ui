import {DatePipe} from '@angular/common';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {EventEmitter, Injectable, Output} from '@angular/core';
import {saveAs} from "file-saver";
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Drive} from '../models/drive';
import {DriveItem} from '../models/driveItem';
import {IDriveItem} from '../models/idriveItem';
import {DriveUtil} from "../utils/DriveUtil";
import {PathProcessor} from "../utils/PathProcessor";
import {BaseService} from "./base.service";

@Injectable({
  providedIn: 'root'
})
export class DriveService extends BaseService {

  @Output() alteredDrives = new EventEmitter<IDriveItem[]>();

  constructor(public http: HttpClient, public datepipe: DatePipe) {
    super('drives', http);
  }

  addActionAuditMessages(actionAudits: any[], skipStart: boolean = false, skipFinish: boolean = false) {
    let messages: any[] = [];

    for (let aud of actionAudits) {
      let sourceDriveId = aud.drive ? aud.drive.driveId : 0;

      let sourceDriveDisplay = this.findDrive(sourceDriveId).displayName;
      let destDriveDisplay = this.findDrive(aud.destDriveId).displayName;

      let audPath = sourceDriveDisplay + '/' + aud.path;
      let audDestPath = destDriveDisplay + '/' + aud.destPath;

      let start = "";
      let finish = "";

      let success = (aud.status == 'S');

      switch (aud.action) {
        case "restore":
          start += 'Requesting restore of file: ' + audPath;
          finish += (success ? 'Requested restore of file: ' : 'Problem while requesting restore of file: ') + audPath;
          break;
        case "updateStorageClass":
          let actionDesc = ' the storage class for the following file from ' + aud.oldStorageClass + ' to ' + aud.newStorageClass + ': ' + audPath;

          start += 'Changing ' + actionDesc;
          finish += (success ? 'Changed' : 'Problem while changing') + actionDesc;
          break;
        case "mkdir":
          start += 'Creating folder: ' + audPath;
          finish += (success ? 'Created folder: ' : 'Problem while creating folder: ') + audPath;
          break;
        case "uploadchunk":
        case "upload":
          start += 'Uploading file: ' + audPath;
          finish += (success ? 'Uploaded file: ' : 'Problem while uploading file: ') + audPath;
          break;
        case "extract":
          start += 'Extracting file: ' + audPath;
          finish += (success ? 'Extracted file: ' : 'Problem while extracting file: ') + audPath;
          break;
        case "rename":
          start += 'Renaming file: ' + audPath + ' to: ' + aud.destPath;
          finish += (success ? 'Renamed file: ' : 'Problem while renaming file: ') + audPath + ' to: ' + aud.destPath;
          break;
        case "delete":
          start += 'Deleting file: ' + audPath;
          finish += (success ? 'Deleted file: ' : 'Problem while deleting file: ') + audPath;
          break;
        case "download":
        case "preview":
          start += 'Downloading file: ' + audPath;
          finish += (success ? 'Downloaded file: ' : 'Problem while downloading file: ') + audPath;
          break;
        case "move":
          start += 'Moving file: ' + audPath + ' to ' + audDestPath;
          finish += (success ? 'Moved file: ' : 'Problem while moving file: ') + audPath + ' to ' + audDestPath;
          break;
        case "copy":
          start += 'Copying file: ' + audPath + ' to ' + audDestPath;
          finish += (success ? 'Copied file: ' : 'Problem while copying file: ') + audPath + ' to ' + audDestPath;
          break;
        case "addExternalTableReference":
          start += 'Adding file to BDV: ' + audPath;
          finish += (success ? 'Added file to BDV: ' : 'Problem while adding file to BDV: ') + audPath;
          break;
        case "deleteWorkspace":
        case "createWorkspace":
        case "createDrive":
          //these actions are not logged since they are not a data change
          break;
      }

      if (aud.useMessage && aud.message) {
        finish = aud.message;
      }

      let createdDate = aud.created ? ((this.datepipe.transform(new Date(aud.created), 'EEEE, MMMM d, y, HH:mm:ss zzzz') || '') + ' : ') : "";
      let updatedDate = aud.updated ? ((this.datepipe.transform(new Date(aud.updated), 'EEEE, MMMM d, y, HH:mm:ss zzzz') || '') + ' : ') : "";

      if (createdDate && start && !skipStart) {
        messages.push({message: createdDate + start, timeStamp: aud.created});
      }
      if (updatedDate && finish && !skipFinish) {
        messages.push({message: updatedDate + finish, timeStamp: aud.updated});
      }
    }

    messages.sort((a, b) => a.timeStamp - b.timeStamp);

    messages = messages.map(item => item.message);

    this._messages.next(messages.reverse().concat(this._messages.value));
  }

  private _driveCache: BehaviorSubject<Drive[]> = new BehaviorSubject<Drive[]>([
    new Drive(),
    new Drive()
  ]);

  public driveItemDisplay(driveItem: IDriveItem): string {
    let isRoot = PathProcessor.isRoot(driveItem.path);
    return this.findDrive(driveItem.driveId).displayName + (isRoot ? '' : PathProcessor.addFirstSlash(driveItem.path));
  }

  private _inProgressItems: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private _messages: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['Welcome to the MDACA Cloud Storage Explorer!']);

  public getDrives(isAdminTab: boolean = false): Observable<Drive[]> {

    // @ts-ignore
    let drives = super.getList<Drive>('list?isAdminTab=' + isAdminTab, Drive);

    drives.pipe(map((drives) => {
      return drives.map((drive) => {

        drive.displayPath = drive.displayName;

        return drive;
      })
    })).subscribe(drivesResp => {
      if (!isAdminTab) {
        this._driveCache.next(drivesResp);
      }
    });

    return drives;
  }

  public anyExists(driveItems: DriveItem[]): Observable<Object> {
    let body = {driveId: driveItems[0].driveId, paths: this.buildPathsList(driveItems)};

    return super.post('anyExists', body);
  }
  
  public abortInProgress(auditId: number): void {
    this.http.get<any>(BaseService.rootUrl + 'users/abort?auditId=' + auditId).subscribe();
  }
  
  public getUserInProgress(): Observable<any> {
    return this.http.get<any>(BaseService.rootUrl + 'users/in-progress');
  }

  public getUserInfo(): Observable<any> {
    return this.http.get<any>(BaseService.rootUrl + 'users/info');
  }

  public getAppInfo(): Observable<any> {
    return this.http.get<any>(BaseService.rootUrl + 'users/app/info');
  }
  
  setInProgress(inProg: any) {
    this._inProgressItems.next(inProg.slice(0, 50));
  }

  public addInProgress(inProg: any[]): void {
    this._inProgressItems.next(inProg.concat(this._inProgressItems.value).slice(0, 50));
  }

  public addMessages(messages: string[]): void {

    let start = (this.datepipe.transform(new Date(), 'EEEE, MMMM d, y, HH:mm:ss zzzz') || '') + ' : ';
    let ret = [];
    for (let i = 0; i < messages.length; i++) {
      ret.push(start + messages[i]);
    }
    this._messages.next(ret.concat(this._messages.value).slice(0, 500));
  }

  public downloadFile(driveItem: DriveItem, topLines: number = 0, bottomLines: number = 0): void {
    // Create url
    let url = BaseService.rootUrl + 'drives/download';
    var body = {path: driveItem.path, driveId: driveItem.driveId, topLines: topLines, bottomLines: bottomLines};

    let driveItemDisplay = this.driveItemDisplay(driveItem);

    this.addMessages(['Downloading file: ' + driveItemDisplay]);

    this.http.post(url, body, {
      responseType: "blob",
      headers: new HttpHeaders().append("Content-Type", "application/json")
    }).subscribe(
      data => {
        saveAs(data, driveItem.displayName);
        this.addMessages(['Downloaded file: ' + driveItemDisplay]);
      },
      err => {
        this.addMessages(['Problem while downloading the file: ' + driveItemDisplay]);
      }
    );
  }

  public mkdir(driveItem: DriveItem): void {
    let body = {driveId: driveItem.driveId, path: driveItem.path};

    let driveItemDisplay = this.driveItemDisplay(driveItem);

    this.addMessages(['Creating folder: ' + driveItem.displayName + ' at ' + driveItemDisplay]);

    super.post('mkdir', body)
      .subscribe((resp: any) => {

        this.addMessages(['Created folder: ' + driveItem.displayName + ' at ' + driveItemDisplay]);

        this.getDrives().subscribe();
        this.notifyDrives([driveItem]);
      },
      err => {
        this.addMessages(['Problem while creating folder: ' + driveItem.displayName]);
      });
  }

  public extractFile(driveItem: DriveItem): void {
    let body = {driveId: driveItem.driveId, path: driveItem.path};
    let driveItemDisplay = this.driveItemDisplay(driveItem);

    this.addMessages(['Extracting: ' + driveItemDisplay]);

    super.post('extract', body)
      .subscribe((resp: any) => {

        this.addMessages(['Extracted: ' + driveItemDisplay]);

        this.notifyDrives([driveItem]);
      },
      err => {
        this.addMessages(['Problem while extracting: ' + driveItemDisplay]);
      });
  }

  uploadEmptyFile(driveItem: DriveItem) {
    let path = driveItem.path;

    let body = {driveId: driveItem.driveId, path: path};

    let displayPath = this.driveItemDisplay(driveItem);

    super.post('uploadEmptyFile', body)
      .subscribe((resp: any) => {
          this.addMessages(['Uploaded file: ' + displayPath]);
          this.notifyDrives([driveItem]);
        },
        err => {
          this.addMessages(['Problem while uploading: ' + displayPath]);
        });
  }

  public rename(driveItem: DriveItem, newPath: string): void {

    let body = {
      sourcePath: driveItem.path,
      sourceDriveId: driveItem.driveId,
      destDriveId: driveItem.driveId,
      destPath: newPath,
      removeSource: true
    };

    this.addMessages(['Renaming file: ' + driveItem.displayPath + ' to: ' + newPath]);

    super.post('rename', body)
      .subscribe((resp: any) => {

        this.addMessages(['Renamed file: ' + driveItem.displayPath + ' to: ' + newPath]);

        this.notifyDrives([driveItem]);
      },
      err => {
        this.addMessages([err.error.exceptionMessage]);
      });
  }

  public archive(driveItems: DriveItem[], storageClass: any): void {

    let body = {
      driveItems: DriveUtil.buildSimpleDriveItems(driveItems),
      newStorageClass: storageClass
    };

    for (let item of driveItems) {
      let audit = DriveUtil.buildActionAudit("updateStorageClass", item, true);
      audit.newStorageClass = storageClass.displayText;

      this.addActionAuditMessages([audit]);
    }

    super.post('updateStorageClass', body)
      .subscribe((resp: any) => {

        // @ts-ignore
        this.addActionAuditMessages(resp.audits, true);

        this.notifyDrives([driveItems[0]])
      }, (resp: HttpErrorResponse) => {
        this.addActionAuditMessages(resp.error.audits, true);
      });
  }

  public restore(driveItem: DriveItem, expirationDays: number): void {
    let body = {path: driveItem.path, driveId: driveItem.driveId, daysExpiration: expirationDays};

    this.addMessages(['Requesting restore of file: ' + driveItem.displayPath]);

    super.post('restore', body)
      .subscribe((resp: any) => {

        this.addMessages(['Requested restore of file: ' + driveItem.displayPath]);

        this.notifyDrives([driveItem]);
      },
      err => {
        this.addMessages(['Problem while requesting restore of file: ' + driveItem.displayPath]);
      });
  }

  public addExternalTableReference(driveItem: DriveItem, databaseName: string, tableName: string): void {
    let itemDisplay = this.driveItemDisplay(driveItem);

    let body = {
      path: driveItem.path,
      driveId: driveItem.driveId,
      databaseName: databaseName,
      tableName: tableName
    };

    this.addMessages(['Adding file to BDV: ' + itemDisplay]);

    super.post('addExternalTableReference', body)
      .subscribe((resp: any) => {

        this.addMessages(['Requested add file to BDV: ' + itemDisplay]);

      },
      err => {
        this.addMessages(['Problem while adding file to BDV: ' + itemDisplay]);
      });
  }

  private buildPathsList(driveItems: DriveItem[]) {
    return driveItems.map(driveItem => driveItem.path);
  }

  public delete(driveItems: DriveItem[]): void {

    let body = {
      driveItems: DriveUtil.buildSimpleDriveItems(driveItems)
    };

    let actionAudits = DriveUtil.buildActionAudits("delete", driveItems, true);
    this.addActionAuditMessages(actionAudits);

    super.post('delete', body)
      .subscribe((resp: any) => {

        // @ts-ignore
        this.addActionAuditMessages(resp.audits, true);

        this.notifyDrives([driveItems[0]]);
      }, (resp: HttpErrorResponse) => {
        this.addActionAuditMessages(resp.error.audits, true);
      });
  }

  /**
   * notifies the drives that certain drive items were changed
   * this will cause a refresh IF the drive item is at the level of an open drive
   * @param driveItems the drive item(s) that were deleted, moved, renamed, etc..
   * @private
   */
  private notifyDrives(driveItems: DriveItem[]) {
    //if an item was moved/deleted/renamed/etc..., the parent's contents changed; notify that the parent was changed
    let alteredParents = driveItems.map((item: DriveItem) => item.getParentItem());

    this.alteredDrives.emit(alteredParents);
  }

  /**
   * @param sourceItem source item being moved or copied
   * @param destFolder destination drive OR folder being copied to
   * @param deleteSource indicates to delete the sourceItem if true
   */
  public transfer(sourceItem: DriveItem, destFolder: IDriveItem, deleteSource: boolean): void {
    let destItemName = PathProcessor.getFileName(sourceItem.path) + (sourceItem.directory ? "/" : "");
    let destFolderPath = PathProcessor.isRoot(destFolder.path) ? "" : PathProcessor.addLastSlash(destFolder.path);
    let destItem = new DriveItem();
    destItem.driveId = destFolder.driveId;
    destItem.path = destFolderPath + destItemName;

    let sourceItemDisplay = this.driveItemDisplay(sourceItem);
    let destItemDisplay = this.driveItemDisplay(destItem);

    let body = {
      sourcePath: sourceItem.path,
      sourceDriveId: sourceItem.driveId,
      destPath: destItem.path,
      destDriveId: destItem.driveId,
      removeSource: deleteSource
    };

    this.addMessages([(deleteSource ? 'Moving' : 'Copying') + ' file: ' + sourceItemDisplay + ' to: ' + destItemDisplay]);

    super.post('transfer', body)
      .subscribe((resp: any) => {

        this.addMessages([(deleteSource ? 'Moved' : 'Copied') + ' file: ' + sourceItemDisplay + ' to: ' + destItemDisplay]);

        let alteredDriveItems = [destItem];

        // if the source was deleted then the source drive's contents were altered
        if (deleteSource) {
          alteredDriveItems.push(sourceItem);
        }

      this.notifyDrives(alteredDriveItems);
    }, (resp: HttpErrorResponse) => {
      this.addMessages([(deleteSource ? 'Move ' : 'Copy ') + "failed.  Please try again or contact an admin for more info."]);
    });
  }

  
  /**
   * @param sourceItem source item being moved or copied
   * @param destFolder destination drive OR folder being copied to
   * @param deleteSource indicates to delete the sourceItem if true
   */
   public transferBatch(sourceItems: DriveItem[], destFolder: IDriveItem, deleteSource: boolean): void {

    let batchBody = [];

    for(var i = 0; i < sourceItems.length; i++) {
      let sourceItem = sourceItems[i];
      
    let destItemName = PathProcessor.getFileName(sourceItem.path) + (sourceItem.directory ? "/" : "");
    let destFolderPath = PathProcessor.isRoot(destFolder.path) ? "" : PathProcessor.addLastSlash(destFolder.path);
    let destItem = new DriveItem();
    destItem.driveId = destFolder.driveId;
    destItem.path = destFolderPath + destItemName;

    let sourceItemDisplay = this.driveItemDisplay(sourceItem);
    let destItemDisplay = this.driveItemDisplay(destItem);

    let body = {
      sourcePath: sourceItem.path,
      sourceDriveId: sourceItem.driveId,
      destPath: destItem.path,
      destDriveId: destItem.driveId,
      removeSource: deleteSource
    };

    batchBody.push(body);

    this.addMessages([(deleteSource ? 'Moving' : 'Copying') + ' file: ' + sourceItemDisplay + ' to: ' + destItemDisplay]);

    }

    super.post('transferBatch', batchBody)
      .subscribe((resp: any)  => {

        let alteredDriveItems = [];

        for(var i = 0; i < sourceItems.length; i++) {
          let sourceItem = sourceItems[i];
            
          let destItemName = PathProcessor.getFileName(sourceItem.path) + (sourceItem.directory ? "/" : "");
          let destFolderPath = PathProcessor.isRoot(destFolder.path) ? "" : PathProcessor.addLastSlash(destFolder.path);
          let destItem = new DriveItem();
          destItem.driveId = destFolder.driveId;
          destItem.path = destFolderPath + destItemName;

          let sourceItemDisplay = this.driveItemDisplay(sourceItem);
          let destItemDisplay = this.driveItemDisplay(destItem);

          this.addMessages([(deleteSource ? 'Moved' : 'Copied') + ' file: ' + sourceItemDisplay + ' to: ' + destItemDisplay]);
          
          alteredDriveItems.push(destItem);
          // if the source was deleted then the source drive's contents were altered
          if (deleteSource) {
            alteredDriveItems.push(sourceItem);
          }
        }

      this.notifyDrives(alteredDriveItems);

    }, (resp: HttpErrorResponse) => {
      this.addMessages([(deleteSource ? 'Move ' : 'Copy ') + "failed.  Please try again or contact an admin for more info."]);
    });
  }

  public findDrive(driveId: number): any {
    let drives = this._driveCache.value;
    for (const drive of drives) {
      if (drive.driveId == driveId) {
        return drive;
      }
    }

    let unknownDrive = new Drive();
    unknownDrive.displayName = "(unknown drive)";
    return unknownDrive;
  }

  public updateChildItems(driveItem: IDriveItem) : Observable<DriveItem[]> {
    driveItem.loading = true;
    driveItem.items.forEach(item => {
      item.checked = false
    });
    return super.post<DriveItem[]>('query', {
      driveId: driveItem.driveId,
      startPath: driveItem.path,
      recursive: false,
      searchPattern: ''
    }).pipe(
      map((children: DriveItem[]) => {
        children = children.map((child:DriveItem) => {

          child.displayName = PathProcessor.getFileName(child.path);
          child.displayPath = this.driveItemDisplay(child);

          return DriveUtil.cloneDriveItem(child);
        });

        driveItem.items = children;

        driveItem.sortItems();

        driveItem.loading = false;

        return children;
      }));
  }

  public getFolders(driveItem: IDriveItem): Observable<DriveItem[]> {
    return this.updateChildItems(driveItem).pipe(map((items: DriveItem[]) => {

      let folders = items.filter(item => item.directory);

      return folders
        .sort((a: DriveItem, b: DriveItem) =>
          a.displayName.localeCompare(b.displayName)
        );
    }));
  }

  public readonly driveCache: Observable<Drive[]> = this._driveCache.asObservable();

  public readonly messages: Observable<string[]> = this._messages.asObservable();

  public readonly inProgressItems: Observable<any[]> = this._inProgressItems.asObservable();

}
