import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval } from 'rxjs';
import * as chroma from 'chroma-js/chroma';
import { Log } from './log';
import { LogService } from './log.service';
import { first, takeWhile } from 'rxjs/operators';

const UPDATE_INTERVAL_MILLIS = 5*1000;
const LOG_TIMEOUT_MILLIS = 5*60*1000;

const MIN_TEMPERATURE = 10;
const MAX_TEMPERATURE = 45;
const COLOR_SCALE = chroma.scale(['lightgreen', 'blue', 'orange', 'red', 'darkred'])
                          .colors(MAX_TEMPERATURE - MIN_TEMPERATURE + 1);

@Component({
  selector: '[loggers]',
  templateUrl: 'loggers.component.html',
  providers: [LogService]
})
export class LoggersComponent implements OnInit, OnDestroy {

  private alive: boolean;
  loggers: Log[];


  constructor(private logService: LogService) {
    this.alive = true;
  }

  ngOnInit() : void {
    // Getting data once on component initialization
    this.logService.getLatestLogs()
                    .pipe(first())
                    .subscribe(logs => this.loggers = logs);

    // Getting data in an interval
    interval(UPDATE_INTERVAL_MILLIS)
        .pipe(takeWhile(() => this.alive))
        .subscribe(() => this.logService.getLatestLogs()
                                              .subscribe(logs => this.loggers = logs));
  }

  ngOnDestroy() : void {
    this.alive = false;
  }

  getColorByTemperature = (temperature) => COLOR_SCALE[Math.round(temperature) - MIN_TEMPERATURE];

  hasTimedOut = (logTime) => ((new Date().valueOf() - new Date(logTime).valueOf()) > LOG_TIMEOUT_MILLIS);
}
