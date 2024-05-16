import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DriveService} from '../../services/drive.service';
import {WorkspaceConfigService} from "./workspaceConfig.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

 constructor(public driveService: DriveService,
             public workspaceService: WorkspaceConfigService,
             public router: Router) {
  }

  workspaceNameValidationFailed: boolean = false;
  isAdmin: boolean = false;
  isDriveAdmin: boolean = false;

  open(url: string, target: string) {
    window.open(url, target);
  }

  ngOnInit(): void {
    this.driveService.getDrives().subscribe(respDrives => {

      this.driveService.getUserInfo().subscribe(resp => {
        this.userText = 'Welcome, ' + resp.name;
        this.isAdmin = resp.admin;
        this.isDriveAdmin = resp.driveAdmin;
        this.driveService.addActionAuditMessages(resp.actionAudits);
      });

     this.workspaceService.getWorkspaces();

    });

  }


  addWorkspace() {
    this.router.navigate(['/workspace', { workspaceId: this.workspaceService.addWorkspace().workspaceId }]);
  }

  saveWorkspace() {
    if(this.workspaceService._activeWorkspace.workspaceId != 0) {
      this.workspaceNameValidationFailed = false;
      this.workspaceName = '';
      this.opened = true;
    }
  }

  close() {
    this.opened = false;
  }

  openedAppInfo: boolean = false;

  closeAppInfo() {
    this.openedAppInfo = false;
  }

  appInfo: any = {};

  aboutClick() {

    this.driveService.getAppInfo().subscribe(resp => {
      this.appInfo = resp;
      this.openedAppInfo = true;
     });
  }

  openedLogout: boolean = false;

  logout() {
    this.openedLogout = true;
    window.close();
  }

  closeLogout() {
    this.openedLogout = false;
  }

  deleteWorkspace() {
    if(this.workspaceService._activeWorkspace.workspaceId != 0) {
      this.openedDelete = true;
    }
  }

  saveWorkspaceCommit() {
    let workspaceName = this.workspaceName ? this.workspaceName : this.workspaceService._activeWorkspace.workspaceName;

    this.workspaceNameValidationFailed = this.workspaceService.nameAlreadyExists(workspaceName);

    if (!this.workspaceNameValidationFailed) {
      this.workspaceService.saveWorkspace(this.workspaceName);
      this.opened = false;
    }

  }

  closDelete() {
    this.openedDelete = false;
  }

  deleteWorkspaceCommit() {
    this.openedDelete = false;
    this.workspaceService.deleteWorkspace();
    this.router.navigate(['/workspace', { workspaceId: 0 }]);
  }

  openedDelete: boolean = false;

  workspaceName: string = '';

  opened: boolean = false;

  userText: string = 'Loading...';
}
