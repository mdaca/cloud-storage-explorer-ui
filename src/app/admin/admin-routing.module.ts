import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UnsavedChangesGuardService} from "../services/unsavedChangesGuard.service";
import {AdminComponent} from './admin.component';
import {AuditEventLogComponent} from "./audit-event-log/audit-event-log.component";
import {ConfigurationComponent} from "./configuration/configuration.component";
import {DriveMetricsComponent} from "./metrics/drive-metrics.component";

const routes: Routes = [{
  path: 'admin',
  component: AdminComponent,
  children: [
    {
      path: 'audits', component: AuditEventLogComponent
    }, {
      path: 'metrics', component: DriveMetricsComponent
    }, {
      path: 'configuration', component: ConfigurationComponent,
      canDeactivate: [UnsavedChangesGuardService]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
