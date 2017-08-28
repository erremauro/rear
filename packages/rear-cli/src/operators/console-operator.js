// @flow
import resolveApp from 'rear-core/resolve-app';
import {StopWatch} from 'rear-core/stop-watch';
import {getHeader} from '../rear-version';
import { type ReporterType, SilentReporter } from '../reporter';

export class ConsoleOperator {
  props: Object;
  state: Object;
  reporter: ReporterType;
  name: string;

  constructor (props: Object, defaultProps: Object = {}) {
    this.reporter = props.reporter || SilentReporter;
    delete props.reporter;

    this.props = Object.assign({}, defaultProps, props);
    this.timer = new StopWatch()
    this.state = {};
  }

  setProps (newProps: any): void {
    this.props = Object.assign({}, this.props, newProps);
  }

  setState (newState: any): void {
    this.state = Object.assign({}, this.state, newState);
  }

  printHeader (stage?: string): void {
    const header = getHeader(stage);
    this.reporter.highlight(header);
  }

  printFooter (): void {
    this.reporter.log(`:sparkles: Done in ${this.timer.toString('s')}.`);
  }

  performLifeCycle () {

  }

  resolveApp (...args: Array<string>): string {
    return resolveApp(...args);
  }
}

export default ConsoleOperator;
