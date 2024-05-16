import {Component, OnInit} from '@angular/core';
import {DriveService} from '../services/drive.service';
import {Drive} from '../models/drive';
import {ActivatedRoute} from '@angular/router';
import {WorkspaceConfig} from '../models/workspaceConfig';
import {IDriveItem} from '../models/idriveItem';
import {WorkspaceConfigService} from "../layout/header/workspaceConfig.service";

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {

  public leftDrive: IDriveItem = new Drive();
  public rightDrive: IDriveItem = new Drive();

  public drives: Drive[] = [];
  public config: WorkspaceConfig = new WorkspaceConfig();

  constructor(private driveService: DriveService,
              private workspaceService: WorkspaceConfigService,
              private route: ActivatedRoute) {
    driveService.driveCache.subscribe(drives => {
      this.drives = drives;
    });
  }

  ngOnInit(): void {
    this.route
      .params
      .subscribe(wsParams => {
        let workspaceId =  wsParams.workspaceId || 0;

        let ws = this.workspaceService.findWorkspace(workspaceId);

        if (!ws) {
          return;
        }

        this.config = ws;
        this.workspaceService.setActiveWorkspace(ws);

        let newLeftDrive = ws.getLeftDrive();
        let newRightDrive = ws.getRightDrive();

        //only change the drives if they are different than the one's currently in use
        if (!this.leftDrive.equals(newLeftDrive)) {
          this.leftDrive = newLeftDrive;
        }
        if (!this.rightDrive.equals(newRightDrive)) {
          this.rightDrive = newRightDrive;
        }

      });
  }

}
