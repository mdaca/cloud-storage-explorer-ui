import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AuditStatistics} from "../models/auditStatistics";
import {Drive} from '../models/drive';
import {GridStateSpec} from "../models/gridStateSpec";
import {BaseService} from "./base.service";

@Injectable({
  providedIn: 'root'
})
export class AdminService extends BaseService {

  constructor(public http: HttpClient) {
    super('admin', http);
  }

  public createDrives(drives: Drive[]): Observable<any> {
    let simpleDrives = drives.map(drive => drive.toSimpleDrive());

    return super.post('drives', {drives: simpleDrives});
  }

  public updateDrives(drives: Drive[]): Observable<any> {
    let simpleDrives = drives.map(drive => drive.toSimpleDrive());

    return super.put('drives', {drives: simpleDrives});
  }

  public getAudits(gridStateSpec: GridStateSpec): Observable<any> {
    return super.post<any[]>('audit', gridStateSpec);
  }

  public testConnection(drive: Drive): Observable<boolean> {
    return super.post<boolean>('testConnection', drive.toSimpleDrive());
  }

  public getAuditStatistics(): Observable<AuditStatistics> {
    let body = {
      status: "P"
    };
    // @ts-ignore
    return super.postOne<AuditStatistics>('auditStatistics', body, AuditStatistics);
  }

}
