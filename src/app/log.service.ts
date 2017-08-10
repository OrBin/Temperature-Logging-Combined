import { Injectable } from '@angular/core';
import { Log } from './log';

@Injectable()
export class LogService {
  getLatestLogs(): Log[] {
    return [] as Log[];
  }
}
