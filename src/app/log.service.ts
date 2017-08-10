import { Injectable } from '@angular/core';
import { Log } from './log';

@Injectable()
export class LogService {
  getLatestLogs(): Promise<Log[]> {
    return Promise.resolve([] as Log[]);
  }
}
