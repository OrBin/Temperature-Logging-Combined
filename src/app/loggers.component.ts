import { Component, OnInit } from '@angular/core';
import { RoundPipe } from 'angular-pipes/src/math/round.pipe';
import * as chroma from 'chroma-js/chroma';
import { Log } from './log';
import { LogService } from './log.service';

const MIN_TEMPERATURE = 10;
const MAX_TEMPERATURE = 45;
const COLOR_SCALE = chroma.scale(['lightgreen', 'blue', 'orange', 'red', 'darkred'])
                          .colors(MAX_TEMPERATURE - MIN_TEMPERATURE + 1);

@Component({
  selector: '[loggers]',
  templateUrl: 'loggers.component.html',
  providers: [LogService]
})
export class LoggersComponent implements OnInit {

  loggers: Log[];

  constructor(private logService: LogService) { }

  ngOnInit() : void {
    this.loggers = this.logService.getLatestLogs();
  }

  getColorByTemperature = (temperature) => COLOR_SCALE[Math.round(temperature) - MIN_TEMPERATURE];
}
