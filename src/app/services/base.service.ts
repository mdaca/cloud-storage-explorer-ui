import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {PathProcessor} from "../utils/PathProcessor";

export abstract class BaseService {

  //public static readonly rootUrl: string = 'http://mpjboss.spinsys.com:8085/storage-explorer/rest/';
  // public static readonly rootUrl: string = 'http://localhost:8080/storage-explorer/rest/';
  public static readonly rootUrl: string = '/storage-explorer/rest/';

  private readonly baseUrl;

  private JSON_HEADER = new HttpHeaders().append("Content-Type", "application/json");

  private BASIC_OPTIONS = {headers: this.JSON_HEADER};

  protected constructor(public basePath: string, public http: HttpClient) {
    this.baseUrl = BaseService.rootUrl + basePath + PathProcessor.GUI_SEP;
  }

  public get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.baseUrl + path, this.BASIC_OPTIONS);
  }

  getList<T>(path: string, clazz: T) {
    // @ts-ignore
    return this.get(path).pipe(this.mapList<T>(clazz));
  }

  public post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(this.baseUrl + path, body, this.BASIC_OPTIONS);
  }

  public postOne<T>(path: string, body: any, clazz: T): Observable<T> {
    return this.post<T>(path, body).pipe(map((jsObj: T) => {
      // @ts-ignore
      return Object.assign(new clazz(), jsObj);
    }));
  }

  public postList<T>(path: string, body: any, clazz: T) {
    // @ts-ignore
    return this.post(path, body).pipe(this.mapList<T>(clazz));
  }

  public put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(this.baseUrl + path, body, this.BASIC_OPTIONS);
  }

  /**
   * maps the list of JSON objects to a list of Data objects
   * this allows methods to be called on the objects themselves
   */
  private mapList<T>(clazz: T) {
    return map((jsObjs: T[]) => {
      return jsObjs.map((jsObj: T) => {
        // @ts-ignore
        return Object.assign(new clazz(), jsObj);
      });
    });
  }

}
