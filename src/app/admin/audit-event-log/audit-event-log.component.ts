import {Component, OnInit, OnDestroy} from "@angular/core";
import {State} from "@progress/kendo-data-query";
import {AuditStatistics} from "../../models/auditStatistics";
import {AuditStatus} from "../../models/auditStatus";
import {GridStateSpec} from "../../models/gridStateSpec";
import {ListAuditStatistics} from "../../models/list-models/listAuditStatistics";
import {AdminService} from "../../services/admin.service";

@Component({
  selector: 'audit-event-log',
  templateUrl: './audit-event-log.component.html',
  styleUrls: ['./audit-event-log.component.scss']
})
export class AuditEventLogComponent implements OnInit, OnDestroy {

  public viewAudit: { data: any[], total: number } = {data: [], total: 0};
  public gridStateAudit: State = {
    sort: [],
    skip: 0,
    take: 10,
    filter: {
      logic: 'and',
      filters: []

    }
  };

  public auditStatusValues: any[] = [];
  public auditStatistics: ListAuditStatistics = new ListAuditStatistics();
  public refreshPendingActionsInterval: any;

  public AuditStatus = AuditStatus;

  constructor(public adminService: AdminService) {
    this.adminService = adminService;

    this.setPendingAuditsTrigger();
  }

  public ngOnInit(): void {
    for (let prop in AuditStatus) {
      // @ts-ignore
      this.auditStatusValues.push({text: AuditStatus[prop], status: prop});
    }

    this.updateAudits(this.gridStateAudit);
  }

  public ngOnDestroy() {
      if (this.refreshPendingActionsInterval) {
        clearInterval(this.refreshPendingActionsInterval);
      }
  }

  public onStateChangeAudit(state: State) {
    this.gridStateAudit = state;

    this.updateAudits(state);
  }

  private updateAudits(gridState: any) {
    let gridStateSpec = new GridStateSpec();
    gridStateSpec.sortField = 'created';

    if (gridState.sort.length == 1) {
      gridStateSpec.sortField = gridState.sort[0].field;
      gridStateSpec.sortDir = gridState.sort[0].dir;
    }

    gridStateSpec.startRow = gridState.skip;
    gridStateSpec.endRow = gridStateSpec.startRow + gridState.take;
    gridStateSpec.filters = gridState.filter.filters;

    return this.adminService.getAudits(gridStateSpec).subscribe(response => {
      this.viewAudit = {data: response.audits, total: response.total};
    });
  }

  /** collects the pending audit data every 5 seconds */
  private setPendingAuditsTrigger() {
    const FIVE_SECOND = 5_000;

    this.refreshPendingActionsInterval = window.setInterval(() => {
      this.updateAudits(this.gridStateAudit);

      this.adminService.getAuditStatistics()
        .subscribe((auditStats: AuditStatistics) => {
          this.auditStatistics.add(auditStats);
        });
    }, FIVE_SECOND);
  }

}
