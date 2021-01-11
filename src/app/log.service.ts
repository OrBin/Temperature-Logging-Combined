import { Injectable, isDevMode } from '@angular/core';
import { Log } from './log';
import { Http } from '@angular/http';
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable()
export class LogService {

  private logsUrl = isDevMode() ? 'http://localhost:5000/latest' : './api/latest';

  constructor(private http: Http) { }

  getLatestLogs(): Observable<Log[]>{
    return this.http.get(this.logsUrl)
                    .pipe(map(response => response.json() as Log[]));
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
