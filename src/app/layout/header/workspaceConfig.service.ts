import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {WorkspaceConfig} from "../../models/workspaceConfig";
import {BaseService} from "../../services/base.service";

@Injectable()
export class WorkspaceConfigService extends BaseService {

  private DEFAULT_WORKSPACE = new WorkspaceConfig('Default Workspace', 0);

  public workspaces: WorkspaceConfig[] = [this.DEFAULT_WORKSPACE];

  public _activeWorkspace: WorkspaceConfig = this.DEFAULT_WORKSPACE;

  constructor(public http: HttpClient) {
    super('workspaces', http);
  }

  public addWorkspace(): WorkspaceConfig {

    let workspace = new WorkspaceConfig("New Workspace");
    this.workspaces.push(workspace);

    return workspace;
  }

  saveWorkspace(workspaceName: string) {
    if (workspaceName.length > 0) {
      this._activeWorkspace.workspaceName = workspaceName;
    }

    if (this._activeWorkspace.workspaceId < 0) {
      super.put<any>('create', this._activeWorkspace).subscribe(resp => {
        this._activeWorkspace.workspaceId = resp.workspaceId;
      });
    } else if (this._activeWorkspace.workspaceId > 0) {
      super.post('update', this._activeWorkspace).subscribe(resp => {
      });
    }
  }

  public getWorkspaces(): void {
    // @ts-ignore
    super.getList<WorkspaceConfig>('list', WorkspaceConfig)
        .subscribe((workspaces: WorkspaceConfig[]) => {
          this.workspaces = [this.DEFAULT_WORKSPACE, ...workspaces];
        });
  }

  deleteWorkspace() {
    if (this._activeWorkspace.workspaceId > 0) {
      super.post('delete', this._activeWorkspace).subscribe(resp => {
      });
    }
    let activeId = this._activeWorkspace.workspaceId;

    this.workspaces = this.workspaces.filter((item) => {
      return item.workspaceId != activeId
    });

    this._activeWorkspace = new WorkspaceConfig();
  }

  setActiveWorkspace(config: WorkspaceConfig) {
    this._activeWorkspace = config;
  }

  public findWorkspace(workspaceId: number): any {
    for (const item of this.workspaces) {
      if (item.workspaceId == workspaceId) {
        return item;
      }
    }
    return null;
  }

  nameAlreadyExists(workspaceName: string): boolean{
    for (const workspace of this.workspaces) {
      if(workspace.workspaceName == workspaceName && this._activeWorkspace.workspaceId != workspace.workspaceId) {
        return true;
      }
    }
    return false;
  }

}
