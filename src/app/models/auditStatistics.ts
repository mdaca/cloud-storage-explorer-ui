export class AuditStatistics {

  download: number = 0;
  preview: number = 0;

  upload: number = 0;
  uploadchunk: number = 0;

  move: number = 0;
  copy: number = 0;
  rename: number = 0;

  extract: number = 0;

  delete: number = 0;

  addExternalTableReference: number = 0;
  createDrive: number = 0;
  exists: number = 0;
  mkdir: number = 0;
  updateDrive: number = 0;
  updateDriveProperty: number = 0;
  updateDriveSecurityRule: number = 0;
  updateDriveUser: number = 0;
  updateStorageClass: number = 0;

  constructor() {
  }

  public getTotalPending() {
    return this.getDownloadTotal() + this.getUploadTotal() + this.getMoveTotal() + this.extract + this.delete;
  }

  /** total count of download-type actions (download and preview)*/
  public getDownloadTotal() {
    return this.download + this.preview;
  }

  /** total count of upload-type actions (upload, uploadchunk)*/
  public getUploadTotal() {
    return this.upload + this.uploadchunk;
  }

  /** total count of move-type actions (move, copy, and rename)*/
  public getMoveTotal() {
    return this.move + this.copy + this.rename;
  }

}
