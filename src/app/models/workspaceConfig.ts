import {Drive} from "./drive";

export class WorkspaceConfig {
  workspaceName: string = '';
  workspaceId: number = 0;

  leftDriveId: number = 0;
  leftPath: string = '/';
  leftSearchText: string = '';
  leftSortField: string = 'displayName';
  leftSortAsc: boolean = true;

  rightDriveId: number = 0;
  rightPath: string = '/';
  rightSearchText: string = '';
  rightSortField: string = 'displayName';
  rightSortAsc: boolean = true;

  constructor(workspaceName: string = '', id: number = -1) {
    this.workspaceName = workspaceName;
    this.workspaceId = id;

    if (id == -1) {
      this.workspaceId = workspaceUid--;
    }
  }

  public getLeftDrive(): Drive {
    let drive = new Drive();

    drive.driveId = this.leftDriveId;
    drive.path = this.leftPath;
    drive.searchText = this.leftSearchText;
    drive.sortField = this.leftSortField;
    drive.isAsc = this.leftSortAsc;

    return drive;
  }

  public getRightDrive(): Drive {
    let drive = new Drive();

    drive.driveId = this.rightDriveId;
    drive.path = this.rightPath;
    drive.searchText = this.rightSearchText;
    drive.sortField = this.rightSortField;
    drive.isAsc = this.rightSortAsc;

    return drive;
  }

  public isDefault(): boolean {
    return this.workspaceName == 'Default Workspace';
  }

  public isNew(): boolean {
    return this.workspaceId < 0;
  }

}

let workspaceUid: number = -1;
