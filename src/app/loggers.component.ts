import { Component } from '@angular/core';
import { RoundPipe } from 'angular-pipes/src/math/round.pipe';

@Component({
  selector: '[loggers]',
  templateUrl: 'loggers.component.html'
})
export class LoggersComponent {
  loggers = [];
}
