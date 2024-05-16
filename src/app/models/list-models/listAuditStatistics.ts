import {AuditStatistics} from "../auditStatistics";

/**
 * a collection of data representing the pending actions; used in the ActionAudit admin tab
 * each single number object (ex download, preview, etc...) represents the CURRENT number of pending actions
 *     these fields are inherited from AuditStatistics
 * each array object (downloadArray, previewArray, etc...) represents the ALL pending actions over time
 */
export class ListAuditStatistics extends AuditStatistics {

  //the maximum entries in the tiny chart
  private MAX_DISPLAYABLE_RECORDS = 20;

  //an array representing the total pending actions over time
  public totalArray: number[] = this.buildEmptyArray();
  public downloadArray: number[] = this.buildEmptyArray();
  public uploadArray: number[] = this.buildEmptyArray();
  public moveArray: number[] = this.buildEmptyArray();
  public extractArray: number[] = this.buildEmptyArray();
  public deleteArray: number[] = this.buildEmptyArray();

  /**
   * appends the collected action audit to the end of the respective Arrays
   * AND updates the single-value objects with the most recent data
   */
  add(auditStats: AuditStatistics) {

    //remove oldest element
    if (this.totalArray.length >= this.MAX_DISPLAYABLE_RECORDS) {
      this.totalArray.shift();
      this.downloadArray.shift();
      this.uploadArray.shift();
      this.moveArray.shift();
      this.extractArray.shift();
      this.deleteArray.shift();
    }

    //add the new elements
    this.totalArray.push(auditStats.getTotalPending());
    this.downloadArray.push(auditStats.getDownloadTotal());
    this.uploadArray.push(auditStats.getUploadTotal());
    this.moveArray.push(auditStats.getMoveTotal());
    this.extractArray.push(auditStats.extract);
    this.deleteArray.push(auditStats.delete);

    //update the current audit fields
    this.download = auditStats.download;
    this.preview = auditStats.preview;
    this.upload = auditStats.upload;
    this.uploadchunk = auditStats.uploadchunk;
    this.move = auditStats.move;
    this.copy = auditStats.copy;
    this.rename = auditStats.rename;
    this.extract = auditStats.extract;
    this.delete = auditStats.delete;
  }

  public buildEmptyArray(): number[] {
    return Array(20).fill(0);
  }

}
