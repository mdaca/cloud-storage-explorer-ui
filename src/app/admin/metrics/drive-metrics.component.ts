import {animate, style, transition, trigger} from "@angular/animations";
import {Component} from "@angular/core";
import {FormControl, FormGroup} from '@angular/forms';
import {LegendLabelsContentArgs} from "@progress/kendo-angular-charts";
import {GridDataResult} from "@progress/kendo-angular-grid";
import {orderBy, SortDescriptor} from "@progress/kendo-data-query";
import {Subscription} from "rxjs";
import {DriveItem} from 'src/app/models/driveItem';
import {Drive} from "../../models/drive";
import {IDriveItem} from "../../models/idriveItem";
import {MemoryUsage} from "../../models/memoryUsage";
import {AdminService} from "../../services/admin.service";
import {DriveService} from "../../services/drive.service";
import {MetricsService} from "../../services/metrics.service";
import {ByteUtil} from "../../utils/ByteUtil";
import {DateUtil} from "../../utils/DateUtil";
import {GraphUtil} from "../../utils/GraphUtil";
import {PathProcessor} from "../../utils/PathProcessor";

@Component({
  selector: 'app-metrics',
  templateUrl: './drive-metrics.component.html',
  styleUrls: ['./drive-metrics.component.scss']
})
export class DriveMetricsComponent {

  //disc usage data
  public drives: Drive[] = [];
  public driveUsagesDates: string[] = [];
  public driveUsagesBytes: number[] = [];
  public driveHasUsageData: boolean = false;

  //assume the drive is connectable until it is determined that it cannot
  public cannotConnectToDrive: boolean = false;

  //filters for disc usage
  public filterForm: FormGroup = new FormGroup({
    drive: new FormControl(),
    maxRecords: new FormControl(10),
    startDate: new FormControl(),
    endDate: new FormControl()
  });

  //folders that are inside the selected drive (or selected folder)
  public foldersByDrive: DriveItem[] = []
  //folder usage WITH the simplified "Other" folder (if it is applied)
  public folderUsage: DriveItem[] = [];
  //folder usage WITHOUT the simplified "Other" folder
  public folderUsageFull: DriveItem[] = [];
  public discUsageStep: number = 1;

  //folder use data
  //the selected folder OR drive
  public selectedFolder: IDriveItem = new Drive();
  public selectedFolderKeys: string[] = [];
  public expandedFolderKeys: string[] = [];
  public folderUsageDisplay: string = 'Select an item to display its contents...';
  public isLoadingFolderUsage: boolean = false;
  public folderUsageErrorMessage: string = "";
  // @ts-ignore
  private folderUsageSubscription: Subscription;

  public gridMin: number = 0;
  public gridMax: number = 0;
  public gridMajorUnit: number = 0;
  // @ts-ignore
  public gridViewFolderUsage: GridDataResult;
  public sortFolderUsage: SortDescriptor[] = [
    {
      field: "fileSize",
      dir: "desc"
    }
  ];

  constructor(public adminService: AdminService,
              public driveService: DriveService,
              public metricsService: MetricsService) {
    driveService.getDrives(true)
      .subscribe((drives: Drive[]) => {
        this.drives = drives;

        let firstDrive = drives[0];

        this.filterForm.controls['drive'].setValue(firstDrive);
        this.filterForm.controls['startDate'].setValue(DateUtil.oneWeekAgo());
        this.filterForm.controls['endDate'].setValue(new Date());

        this.refreshDriveMetrics();
      });
  }

  /** refreshes both the disc usage chart AND the folder usage views */
  public refreshDriveMetrics() {

    this.updateDiscUsageChart();
    this.goToRootFolderUsage(true);
  }

  /** refreshes the folder usage tree, pie chart, and grid  */
  public updateDiscUsageChart() {
    this.driveHasUsageData = true;
    this.cannotConnectToDrive = false;

    this.metricsService.getDiscUsage(this.filterForm.value)
      .subscribe((driveUsages: MemoryUsage[]) => {
        if (!driveUsages || !driveUsages.length) {
          //no records were returned, but the connection might be the problem. Check if it is
          this.adminService.testConnection(this.getSelectedDrive())
            .subscribe(successfulConnection => {
              //if the connection is false, display an appropriate error message
              this.cannotConnectToDrive = !successfulConnection;
              this.driveHasUsageData = false;
            });

          return;
        }

        //displays a maximum of 10 X-axis records
        //skips more X-axis labels the more DriveUsage statistics are collected
        this.discUsageStep = Math.ceil(driveUsages.length / 10);

        this.driveUsagesDates = [];
        this.driveUsagesBytes = [];

        for (let driveUsage of driveUsages) {
          this.driveUsagesDates.push(driveUsage.getSimpleDate());
          this.driveUsagesBytes.push(driveUsage.bytes);
        }

        let graphParameters = GraphUtil.getGraphParameters(this.driveUsagesBytes, 5);

        // @ts-ignore
        this.gridMin = graphParameters.get("zMin");
        // @ts-ignore
        this.gridMax = graphParameters.get("zMax");
        // @ts-ignore
        this.gridMajorUnit = graphParameters.get("zTickSize");
      });
  }

  /** resets the folder usage to the root level */
  public goToRootFolderUsage(reloadTreeview: boolean = false) {
    //unselect the selected folder
    this.selectedFolderKeys = [];
    if (reloadTreeview) {
      this.expandedFolderKeys = [];
    }

    let selectedDrive = this.getSelectedDrive();

    //automatically display the drive's usage data when the drive is changed
    this.displayFolderUsage(selectedDrive);

    if (reloadTreeview) {
      this.foldersByDrive = [];
      this.fetchChildren(selectedDrive).subscribe((folders: DriveItem[]) => {
        this.foldersByDrive = folders;
      });
    }
  }

  private getSelectedDrive() {
    return this.filterForm.value.drive;
  }

  goToParentFolderUsage() {
    let parentItem = (<DriveItem>this.selectedFolder).getParentItem();

    this.selectedFolderKeys = [parentItem.path];

    //automatically display the drive's usage data when the drive is changed
    this.displayFolderUsage(parentItem);
    this.focusOnTreeItem(parentItem.path);
  }

  public fetchChildren = (item: any) => {
    let drive = this.getSelectedDrive();
    return this.metricsService.getFolderUsage(drive, item.path);
  }

  public hasChildren(node: any): boolean {
    //all nodes are directories, so it may have children (and thus allow any item to look for children)
    return true;
  }

  /** updates the folder usage in the pie chart */
  public displayFolderUsage(selectedFolder: IDriveItem) {
    // if the user changes the folder or drive while the current folder is loading,
    // unsubscribe from the current call
    if (this.isLoadingFolderUsage) {
      this.folderUsageSubscription.unsubscribe();
    }
    let driveId = selectedFolder.driveId;
    this.selectedFolder = selectedFolder;
    this.folderUsageDisplay = 'Loading data for: ' + selectedFolder.displayPath;
    this.folderUsage = [];
    this.folderUsageFull = [];
    this.isLoadingFolderUsage = true;
    this.folderUsageErrorMessage = "";
    //clears the folderUsage data
    this.updateFolderUsageData();

    let startPath = PathProcessor.isRoot(selectedFolder.path) ? PathProcessor.GUI_SEP : selectedFolder.path;

    //store the subscription in a field so that it can be unsubscribed from
    // (if the user selects a new folder, thus reloading the bottom view)
    this.folderUsageSubscription = this.metricsService.getFolderUsage(this.getSelectedDrive(), startPath)
      .subscribe((folders: DriveItem[]) => {
        if (!folders || !folders.length) {
          this.isLoadingFolderUsage = false;
          this.folderUsageErrorMessage = "No subfolders found!";
          return;
        }
        folders.sort((a: DriveItem, b: DriveItem) => {
          //sort descending
          return b.fileSize - a.fileSize;
        });

        this.folderUsageFull = [...folders];

        let maxDisplayFolders = 10;
        //true IFF the data was shortened, thus including an "Other" folder
        let dataWasSimplified = false;

        let totalBytes = this.getTotalFolderUsageBytes(folders);

        // the maximum displayable records for this pie chart
        // 40 records could be evenly spaced if they are all exactly 2.5% of the chart
        let maxRecords = (folders.length > 40) ? 40 : folders.length;

        for (let i = 0; i < maxRecords; i++) {
          //if a file is less than 2.5% of the overall bytes, it is too small to be displayed
          if (folders[i].fileSize < (totalBytes * (0.025))) {
            maxDisplayFolders = i;
            dataWasSimplified = true;
            break;
          }
        }

        // if data was simplified, build the "Other" folder
        if (dataWasSimplified) {
          let displayableFolders = [...folders].splice(0, maxDisplayFolders);
          let otherFolders = [...folders].splice(maxDisplayFolders, folders.length);

          //a object representing the remaining folders
          let otherFolder = new DriveItem();
          otherFolder.path = "(Other)";

          otherFolders.forEach(memoryUsage => otherFolder.fileSize += memoryUsage.fileSize);

          //if the "other" folder is empty, it doesn't take up space, so don't add it
          if (otherFolder.fileSize != 0) {
            displayableFolders.push(otherFolder);
          }
          this.folderUsage = displayableFolders;
        } else {
          //nothing was hidden, so show all folders
          this.folderUsage = this.folderUsageFull;
        }

        this.updateFolderUsageData();

        if (totalBytes == 0) {
          this.folderUsageErrorMessage = "Only empty folders found!";
        }

        this.isLoadingFolderUsage = false;
      });
  }

  public folderSizeFormatter(args: LegendLabelsContentArgs): string {
    let folder: DriveItem = args.dataItem;

    return folder.getFileSizeDisplay();
  }

  public discSizeFormatter(bytesRowItem: any): string {
    return ByteUtil.getDisplayBytes(bytesRowItem.value);
  }

  getDisplayBytes(bytes: number): string {
    return ByteUtil.getDisplayBytes(bytes);
  }

  getFolderUsageDisplay(selectedFolder: IDriveItem): string {
    if (!selectedFolder.isValid()) {
      return '';
    }

    return selectedFolder instanceof Drive ?
      ('Drive: ' + selectedFolder.displayName) : ('Folder: ' + selectedFolder.displayPath);
  }

  /** displays the subfolders for this folder */
  openFolderUsage(memoryUsage: MemoryUsage) {
    //you can't navigate into the "Other" folder
    if (memoryUsage.path == "(Other)") {
      return;
    }

    //the Drive display name is not included in the MemoryUsage object, so get the Drive name separately
    let displayPath = this.getSelectedDrive().displayName + PathProcessor.GUI_SEP + memoryUsage.path;

    //memoryUsage doesn't store the drive id, so keep the old drive id from the current selected folder
    let selectedFolder = new DriveItem();
    selectedFolder.driveId = this.selectedFolder.driveId;
    selectedFolder.path = memoryUsage.path;
    selectedFolder.displayPath = displayPath;
    selectedFolder.displayName = memoryUsage.path;

    this.selectedFolder = selectedFolder;

    this.selectedFolderKeys = [selectedFolder.path];
    //add/push the new expanded folder, because other expanded folders (especially this folders parents) must be preserved
    this.expandedFolderKeys.push(selectedFolder.getParentFolderPath());

    this.displayFolderUsage(selectedFolder);
    this.focusOnTreeItem(selectedFolder.path);
  }

  /** scrolls the treeview into this particular tree item */
  private focusOnTreeItem(path: string) {
    //focus on the newly selected tree element
    let spanTags = document.getElementsByTagName("span");
    // @ts-ignore
    for (let el of spanTags) {
      //the tree element has a span tag with an attribute "data-path" matching its respective DriveItem path
      if (el.getAttribute("data-path") == path) {
        el.scrollIntoView()
        break;
      }
    }
  }

  public getTotalFolderUsageBytes(folderUsages: DriveItem[]) {
    let totalBytes = 0;
    for (let folderUsage of folderUsages) {
      totalBytes += folderUsage.fileSize;
    }

    return totalBytes;
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sortFolderUsage = sort;
    this.updateFolderUsageData();
  }

  private updateFolderUsageData(): void {
    this.gridViewFolderUsage = {
      data: orderBy(this.folderUsageFull, this.sortFolderUsage),
      total: this.folderUsageFull.length,
    };
  }

  selectedFolderIsDrive() {
    return this.selectedFolder instanceof Drive;
  }

}