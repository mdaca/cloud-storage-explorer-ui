import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
  path: '',
  redirectTo: '/home',
  pathMatch: 'full'
},{
  path: 'workspace',
  redirectTo: '/workspace',
  pathMatch: 'prefix'
},{
  path: 'admin',
  redirectTo: '/admin',
  pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload', useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
