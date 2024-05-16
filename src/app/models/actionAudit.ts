import {Drive} from "./drive";

export class ActionAudit {
  actionAuditId: number = 0;
  username: string = "";
  path: string = "";
  drive: Drive = new Drive();
  action: string = "";
  bytesTransferred: number = 0;
  status: string = "";
  durationMS: number = 0;
  message: string = "";
  stackTrace: string = "";
  destPath: string = "";
  destDriveId: number = 0;
  created: any = null;
  updated: any = null;
  ipAddress: string = "";
  oldStorageClass: string = "";
  newStorageClass: string = "";
  useMessage: boolean = false;

  constructor() {
  }

}
