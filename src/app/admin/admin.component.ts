import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SelectEvent, TabStripComponent} from "@progress/kendo-angular-layout";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  public errorMessages: string[] = []
  public tabs = [
    {index: 0, title: "Audit Event Log", route: 'audits',},
    {index: 1, title: "Drive Metrics", route: 'metrics'},
    {index: 2, title: "Drive Configuration", route: 'configuration'},
  ];
  @ViewChild("tabStrip")//@ts-ignore
  public tabStrip: TabStripComponent;

  public activeTab: { index: number, title: string, route: string } = this.tabs[0];

  constructor(private route: ActivatedRoute,
              private router: Router) {

    this.navigateToPath("audits");
  }

  public ngOnInit() {
  }

  public validatedNavigation(e: SelectEvent) {

    let tab = this.getTabByTitle(e.title);

    if (this.activeTab.title != tab.title) {
      //prevent navigating the tab until the route is confirmed to be successful
      e.preventDefault();
    } else {
      //return to prevent navigating to the same path again (preventing infinite recursion)
      return;
    }

    this.navigateToPath(tab.route)
      .then((successfullyNavigated: boolean) => {
        //successfullyNavigated is false if an unsaved form prevented an exit
        if (successfullyNavigated) {
          this.activeTab = tab;
          //now that we confirmed that navigation is possible, navigate to the tab
          this.tabStrip.selectTab(tab.index);
        }// else do nothing
      });
  }

  public navigateToPath(path: string) {
    return this.router.navigate([path], {relativeTo: this.route});
  }

  public getTabByTitle(title: string) {
    return this.tabs.find(tab => tab.title == title) || this.tabs[0];
  }

}
