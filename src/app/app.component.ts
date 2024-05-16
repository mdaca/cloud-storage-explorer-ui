import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public showHeader = true;
  public showSidebar = true;
  public showFooter = true;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.activatedRoute != null && this.activatedRoute.firstChild != null) {
          let routeData = this.activatedRoute.firstChild.snapshot.data;

          this.showHeader = routeData.showHeader !== false;
          this.showSidebar = routeData.showSidebar !== false;
          this.showFooter = routeData.showFooter !== false;
        }
      }
    });
  }

}
