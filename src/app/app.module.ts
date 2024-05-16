import {DatePipe} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {ButtonsModule} from '@progress/kendo-angular-buttons';
import {DialogsModule} from '@progress/kendo-angular-dialog';
import {GridModule} from '@progress/kendo-angular-grid';
import {LayoutModule} from '@progress/kendo-angular-layout';
import {MenuModule} from '@progress/kendo-angular-menu';
import {TreeListModule} from '@progress/kendo-angular-treelist';
import {TreeViewModule} from '@progress/kendo-angular-treeview';
import {UploadModule} from '@progress/kendo-angular-upload';

import {AdminModule} from './admin/admin.module';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeModule} from './home/home.module';
import {LayoutModule as MdacaLayoutModule} from './layout/layout.module';
import {WorkspaceModule} from './workspace/workspace.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    //Angular
    HttpClientModule, FlexLayoutModule, BrowserModule, BrowserAnimationsModule,
    //Kendo
    ButtonsModule, DialogsModule, GridModule, LayoutModule, MenuModule, TreeListModule, TreeViewModule, UploadModule,
    //internal
    AdminModule, AppRoutingModule, HomeModule, MdacaLayoutModule, WorkspaceModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule {
}
