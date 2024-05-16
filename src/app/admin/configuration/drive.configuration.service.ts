import {Injectable} from '@angular/core';
import {Observable, zip} from 'rxjs';
import {Drive} from "../../models/drive";
import {AdminService} from '../../services/admin.service';
import {DriveUtil} from "../../utils/DriveUtil";

@Injectable()
export class DriveConfigurationService {

  private createdDrives: Drive[] = [];
  private updatedDrives: Drive[] = [];

  constructor(private adminService: AdminService) {
  }

  public create(drive: Drive): void {
    drive = DriveUtil.cloneDrive(drive);

    this.createdDrives.push(drive);
  }

  public update(drive: Drive): void {
    drive = DriveUtil.cloneDrive(drive);

    this.updatedDrives.push(drive);
  }

  public hasChanges(): boolean {
    return Boolean(this.updatedDrives.length || this.createdDrives.length);
  }

  public saveChanges(): Observable<any> {

    let completed: any[] = [];

    if (this.updatedDrives.length) {
      completed.push(this.adminService.updateDrives(this.updatedDrives));
    }

    if (this.createdDrives.length) {
      completed.push(this.adminService.createDrives(this.createdDrives));
    }

    this.reset();

    return zip(...completed);
  }

  public reset() {
    this.updatedDrives = [];
    this.createdDrives = [];
  }

}
