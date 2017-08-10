import { Injectable } from '@angular/core';
import { Log } from './log';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class LogService {

  private logsUrl = '/latest';

  constructor(private http: Http) { }

  getLatestLogs(): Promise<Log[]> {
    return this.http.get(this.logsUrl)
                    .toPromise()
                    .then(response => response.json() as Log[])
                    .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
