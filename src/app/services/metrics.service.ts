import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {map} from 'rxjs/internal/operators/map';
import {Drive} from "../models/drive";
import {MemoryUsage} from "../models/memoryUsage";
import {BaseService} from "./base.service";

@Injectable({
  providedIn: 'root'
})
export class MetricsService extends BaseService {

  constructor(http: HttpClient) {
    super("metrics/disk", http);
  }

  public getDiscUsage({drive, maxRecords, startDate, endDate}: any) {
    //setting the hours ensures that all the data is retrieved across the entire selected days
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 99);

    let body = {
      driveId: drive.driveId,
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      responseSize: maxRecords
    };

    // @ts-ignore
    return super.postList<MemoryUsage>('drive/history', body, MemoryUsage);
  }

  public getFolderUsage(drive: Drive, startPath: string) {
    let body = {
      driveId: drive.driveId,
      startPath: startPath
    }

    // @ts-ignore
    return super.postList<MemoryUsage>('folder/subfolders', body, MemoryUsage)
      .pipe(map((memoryUsages: MemoryUsage[]) => {
        return memoryUsages
          .sort((usageA: MemoryUsage, usageB: MemoryUsage) =>
            usageA.getFileName().localeCompare(usageB.getFileName())
          ).map(memoryUsages => {
            return memoryUsages.toDriveItem(drive);
          })
      }));
  }

}