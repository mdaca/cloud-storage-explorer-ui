import {DriveItem} from './driveItem';
import {DriveProperty} from './driveProperty';
import {DriveSecurityRule} from './driveSecurityRule';
import {IDriveItem} from './idriveItem';
import {DriveUser} from "./driveUser";
import {Validated} from "./interfaces/validated";

export class Drive extends IDriveItem implements Validated {

  displayName: string = '';
  path: string = '';
  driveType: string = '';
  driveId: number = 0;
  items: DriveItem[] = [];
  directory: boolean = true;
  displayPath: string = '';
  securityRules: DriveSecurityRule[] = [];
  providerProperties: DriveProperty[] = [];
  users: DriveUser[] = [];
  sortField: string = '';
  isAsc: boolean = true;
  searchText: string = '';
  storageClasses: any[] = [];
  accessLevels: string[] = [];
  connectionStatus: string = "UNCHECKED";
  loading: boolean = false;
  requiresDaysToExpire: boolean = false;
  //a set of the unsaved properties; includes "DriveSecurityRule" and "DriveUser"
  //providerProperties are prepopulated, so they don't have an add/remove functionality
  unsavedChanges: Set<string> = new Set<string>();

  constructor() {
    super();
  }

  public getIconClass(): string {
    let iconClass = "k-icon ";
    let iconType = this.isCloudProvider() ? "k-i-cloud" : "k-i-toggle-full-screen-mode";

    return iconClass + iconType;
  }

  public isCloudProvider(): boolean {
    return !!(this.storageClasses && this.storageClasses.length);
  }

  public hasHiveProperties(): boolean {
    if (!this.providerProperties || !this.providerProperties.length) {
      return false;
    }

    let hasHiveHostName = false;
    let hasHivePort = false;

    for (let prop of this.providerProperties) {
      hasHiveHostName = hasHiveHostName || (prop.propertyKey == "HiveHostName");
      hasHivePort = hasHivePort || (prop.propertyKey == "HivePort");
    }

    return hasHiveHostName && hasHivePort;
  }

  /** these fields match the Drive object in the Java layer */
  public toSimpleDrive() {

    return {
      driveType: this.driveType,
      driveId: this.driveId,
      displayName: this.displayName,
      securityRules: this.securityRules,
      storageClasses: this.storageClasses,
      users: this.users,
      providerProperties: this.providerProperties
    }
  }

  public validate() {
    let messages = [];

    let hasMissingFields = !this.displayName || !this.driveType;
    if (hasMissingFields) {
      let clarifyingNewWord = this.driveId ? '' : 'new';
      messages.push("A " + clarifyingNewWord + " drive is not fully populated");
      if (!this.displayName) {
        messages.push(" - Please populate 'Display Name'");
      }
      if (!this.driveType) {
        messages.push(" - Please select a 'Drive Type'");
      }
    }
    return messages.length ? messages : null;
  }

  /** validates all the Drive properties, including itself */
  public validateFull(): string[] | null {
    let messages = [];

    let errorMessages = this.validate();
    if (errorMessages) {
      messages.push(...errorMessages);
    }

    //drive properties do not need to be validated

    //security rule records
    for (let rule of this.securityRules) {
      rule = Object.assign(new DriveSecurityRule(), rule);
      let errors = rule.validate();
      if (errors) {
        messages.push("Drive '" + this.displayName + "' has an invalid security rule");

        errors = errors.map(error => " - " + error);
        messages = messages.concat(errors);
      }
    }

    //drive admin records
    for (let user of this.users) {
      user = Object.assign(new DriveUser(), user);
      let errors = user.validate();
      if (errors) {
        messages.push("Drive '" + this.displayName + "' has an invalid Drive Admin");

        errors = errors.map(error => " - " + error);
        messages = messages.concat(errors);
      }
    }

    return messages;
  }

}
