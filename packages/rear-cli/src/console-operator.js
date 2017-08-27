/** @flow */
import fs from 'fs-extra';
import path from 'path';
import version from './rear-version';
import { type ReporterType, SilentReporter } from './reporter';

export class ConsoleOperator {
  props: Object;
  state: Object;
  reporter: ReporterType;
  name: string;

  constructor (props: Object, defaultProps: Object = {}) {
    this.reporter = props.reporter || SilentReporter;
    delete props.reporter;

    this.props = Object.assign({}, defaultProps, props);
    this.state = {};
  }

  setProps (newProps: any): void {
    this.props = Object.assign({}, this.props, newProps);
  }

  setState (newState: any): void {
    this.state = Object.assign({}, this.state, newState);
  }

  printHeader (stage?: string): void {
    const name = stage ? `rear ${stage}` : 'rear';
    this.reporter.highlight(`${name}@v${version}`);
  }

  printFooter (): void {

  }

  performLifeCycle () {

  }

  resolveApp (...args: Array<string>): string {
    if (!this.state.appDirectory) {
      this.setState({ appDirectory: fs.realpathSync(process.cwd()) });
    }
    return path.resolve(this.state.appDirectory, path.join(...args));
  }
}

export default ConsoleOperator;
