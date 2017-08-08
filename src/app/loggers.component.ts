import { Component } from '@angular/core';
import { RoundPipe } from 'angular-pipes/src/math/round.pipe';
import * as chroma from 'chroma-js/chroma';

const MIN_TEMPERATURE = 10;
const MAX_TEMPERATURE = 45;
const COLOR_SCALE = chroma.scale(['lightgreen', 'blue', 'orange', 'red', 'darkred'])
                          .colors(MAX_TEMPERATURE - MIN_TEMPERATURE + 1);

@Component({
  selector: '[loggers]',
  templateUrl: 'loggers.component.html'
})
export class LoggersComponent {
  loggers = [];

  getColorByTemperature = (num) => COLOR_SCALE[Math.round(num) - MIN_TEMPERATURE];
}
