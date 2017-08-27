import {NOOP} from './constants';
import createReporter from 'rear-logger';

export type ReporterType = {
  log(message?: string, ...args?: Array<any>): void,
  info(message: string, ...args?: Array<any>): void,
  error(message: string, ...args?: Array<any>): void,
  warn(message: string, ...args?: Array<any>): void,
  success(message: string, ...args?: Array<any>): void,
  hint(message: string, ...args?: Array<any>): void,
  debug(message: string, ...args?: Array<any>): void,
  highlight(message: string, ...args?: Array<any>): void,
}

export const SilentReporter: ReporterType = {
  success:   NOOP,
  info:      NOOP,
  error:     NOOP,
  warn:      NOOP,
  log:       NOOP,
  debug:     NOOP,
  hint:      NOOP,
  highlight: NOOP
}

export const Reporter: ReporterType = createReporter('rear');
export default Reporter;
