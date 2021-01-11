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

  getColorByTemperature(temperature) {
    return COLOR_SCALE[Math.round(temperature) - MIN_TEMPERATURE];
  }

  hasTimedOut(logTime) {
    return (new Date().valueOf() - new Date(logTime).valueOf()) > LOG_TIMEOUT_MILLIS;
  }

  calculateHeatIndexCelsius(temperatureCelsius, humidity) {
    /*
     * Heat-Index calculator with celsius-grade
     * Formulas are at https://en.wikipedia.org/wiki/Heat_index#Formula
     * GregNau	2015
     * https://github.com/gregnau/heat-index-calc
     * Ported from Python by Or Bin, June 2019
     */

    const temperatureFahrenheit = ((temperatureCelsius * 9/5) + 32);

    // Creating multiples of 'fahrenheit' & 'hum' values for the coefficients
    const T2 = temperatureFahrenheit ** 2;
    const H2 = humidity ** 2;

    // Coefficients for the calculations
    const C1 = [
      -42.379, 2.04901523, 10.14333127, -0.22475541, -6.83783e-03, -5.481717e-02, 1.22874e-03, 8.5282e-04, -1.99e-06
    ];

    // Calculating heat-indexes with 3 different formula
    const heatIndexFahrenheit = C1[0] + (C1[1] * temperatureFahrenheit) + (C1[2] * humidity) +
      (C1[3] * temperatureFahrenheit * humidity) + (C1[4] * T2) + (C1[5] * H2) + (C1[6] * T2 * humidity) +
      (C1[7] * temperatureFahrenheit * H2) + (C1[8] * T2 * H2)
    const heatIndexCelsius = (heatIndexFahrenheit - 32) * 5/9;

    return heatIndexCelsius;//.toFixed(2);
  }
}
