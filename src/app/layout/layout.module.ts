import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DialogsModule} from '@progress/kendo-angular-dialog';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatMenuModule} from '@angular/material/menu';
import {MatListModule} from '@angular/material/list';
import { ScrollingModule  } from '@angular/cdk/scrolling';

import {WindowModule} from '@progress/kendo-angular-dialog';
import {ButtonModule} from '@progress/kendo-angular-buttons';
import {InputsModule} from '@progress/kendo-angular-inputs';
import {MenusModule} from '@progress/kendo-angular-menu';
import { ProgressBarModule } from "@progress/kendo-angular-progressbar";
import {TabStripModule} from '@progress/kendo-angular-layout';
import {TreeViewModule} from '@progress/kendo-angular-treeview';

import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {TransferItemComponent} from './footer/transfer-item/transfer-item.component';

@NgModule({
  declarations: [HeaderComponent, FooterComponent, SidebarComponent, TransferItemComponent],
  imports: [
    //Angular modules
    CommonModule, RouterModule, FormsModule, BrowserModule, BrowserAnimationsModule, DragDropModule, DialogsModule, MatMenuModule, MatListModule,
    //Kendo modules
    WindowModule, ButtonModule, InputsModule, MenusModule, ProgressBarModule, TreeViewModule, TabStripModule, ScrollingModule
  ],
  exports: [HeaderComponent, FooterComponent, SidebarComponent]
})
export class LayoutModule {
}
