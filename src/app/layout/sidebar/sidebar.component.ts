import {Component, Input, OnInit} from '@angular/core';
import {DriveService} from '../../services/drive.service';
import {Drive} from '../../models/drive';
import {IDriveItem} from '../../models/idriveItem';
import {Router} from '@angular/router';
import {ContextMenuSelectEvent} from '@progress/kendo-angular-menu';
import {WorkspaceConfigService} from "../header/workspaceConfig.service";
import {WorkspaceComponent} from "../../workspace/workspace.component";
import { PaneComponent } from 'src/app/workspace/pane/pane.component';
import {DriveItem} from "../../models/driveItem";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input()
  public rootDriveItems: Drive[] = [];

  items: any[] = [
    {
      text: 'Open in left pane',
      selected: (driveItem: DriveItem) => {
        this.selectDriveItem("l", driveItem);
      }
    }, {
      text: 'Open in right pane',
      selected: (driveItem: DriveItem) => {
        this.selectDriveItem("r", driveItem);
      }
    }, {
      text: 'Open in new workspace',
      selected: (driveItem: DriveItem) => {
        let ws = this.workspaceService.addWorkspace();

        this.router.navigate(['/workspace', {workspaceId: ws.workspaceId}]);

        this.selectDriveItem("l", driveItem);
      }
    }
  ];

  constructor(private driveService: DriveService,
              private workspaceService: WorkspaceConfigService,
              private workspaceComponent: WorkspaceComponent,
              private router: Router) {
  }

  public fetchChildren = (item: any) => this.driveService.getFolders(item);

  public hasChildren(node: any): boolean {
    return node.directory;
  }

  ngOnInit(): void {
  }

  public selectDriveItem(lr: string, driveItem: IDriveItem): void {
    PaneComponent.selectionEvent.emit({lr: lr, driveItem: driveItem});
  }

  dropdownSelectHandler(e: ContextMenuSelectEvent) {
    let dataset = e.target.dataset;
    let driveItem = new DriveItem();
    driveItem.driveId = dataset.driveid;
    driveItem.path = dataset.path;

    e.item.selected(driveItem);
  }


}
