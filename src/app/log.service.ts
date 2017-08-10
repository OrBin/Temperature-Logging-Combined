import { Injectable } from '@angular/core';
import { Log } from './log';
import { Http,  } from '@angular/http';
import { Observable } from "rxjs";
import 'rxjs/Rx';

@Injectable()
export class LogService {

  private logsUrl = '/latest';

  constructor(private http: Http) { }

  getLatestLogs(): Observable<Log[]>{
    return this.http.get(this.logsUrl)
                    .map(response => response.json() as Log[]);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
