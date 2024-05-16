import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatRadioModule} from '@angular/material/radio';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {ButtonModule} from '@progress/kendo-angular-buttons';
import {WindowModule} from '@progress/kendo-angular-dialog';
import {AutoCompleteModule} from "@progress/kendo-angular-dropdowns";
import {InputsModule} from '@progress/kendo-angular-inputs';
import {FloatingLabelModule, LabelModule} from "@progress/kendo-angular-label";
import {LayoutModule} from '@progress/kendo-angular-layout';
import {MenusModule} from '@progress/kendo-angular-menu';
import {PopupModule} from '@progress/kendo-angular-popup';
import {TreeViewModule} from '@progress/kendo-angular-treeview';
import {UploadModule} from '@progress/kendo-angular-upload';

import {LayoutModule as MdacaLayoutModule} from '../layout/layout.module';
import {PaneItemComponent} from './pane-item/pane-item.component';
import {PaneItemFilterPipe} from './pane/pane-item-filter.pipe';
import {PaneComponent} from './pane/pane.component';
import {WorkspaceRoutingModule} from './workspace-routing.module';
import {WorkspaceComponent} from './workspace.component';


@NgModule({
  declarations: [PaneComponent, WorkspaceComponent, PaneItemComponent, PaneItemFilterPipe],
  imports: [
    //Angular
    DragDropModule, ScrollingModule, CommonModule, FlexLayoutModule, FormsModule, ReactiveFormsModule, MatCheckboxModule,
    MatFormFieldModule, MatInputModule, MatListModule, MatRadioModule, BrowserModule, BrowserAnimationsModule,
    //Kendo
    ButtonModule, WindowModule, AutoCompleteModule, InputsModule, FloatingLabelModule, LabelModule, LayoutModule,
    MenusModule, PopupModule, TreeViewModule, UploadModule,
    //internal
    MdacaLayoutModule, WorkspaceRoutingModule
  ]
})
export class WorkspaceModule {
}
