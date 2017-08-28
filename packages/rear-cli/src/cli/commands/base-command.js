// @flow
import {Reporter, type ReporterType} from '../../reporter';
import version from '../../rear-version';
import commander from 'commander';

export interface RearCommand {
  hidden: boolean,
  name: string,
  usage: string,
  sortWeight: number,
  aliases: Array<string>,
  cmdUsage: string,
  description: string,
  command: Object,
  reporter: ReporterType,
  run(args: Array<string>): Promise<void>,
  printHelp(): void,
}

export class BaseCommand {
  name: string;
  usage: string;
  hidden: boolean;
  aliases: Array<string>;
  sortWeight: number;
  description: string;
  command: Object;
  reporter: ReporterType;

  constructor (props: Object) {
    this.command = new commander.Command(`rear ${props.name}`);
    this.name = props.name;
    this.cmdUsage = props.usage;
    this.usage = `${this.name} ${this.cmdUsage}`;
    this.description = props.description || '';
    this.sortWeight = this.usage.length + this.description.length;
    this.hidden = props.hidden || false;
    this.aliases = props.aliases || [];
    this.reporter = Reporter;

    delete props.name;
    delete props.usage;
    delete props.description;
    delete props.hidden;

    this.props = Object.assign({}, props);
    this.state = {};
  }

  commandWillRun (): void {
    // Implement this method to setup your
    // command before all arguments are parsed
    // and the command is run.
  }

  async commandDidRun (args: Array<string>): Promise<void> {
    // Command logic should be implemented
    // in this method.
  }

  printHelp (): void {
    // Implement this method to show additional
    // help informations.
  }

  async run (args: Array<string>): Promise<void> {
    this.prepareCommand();
    this.commandWillRun();

    this.command.parse(['rear', this.name].concat(args));

    if (args.indexOf('-h') >= 0 || args.indexOf('--help') >= 0) {
      this.command.outputHelp()
      return Promise.resolve();
    }

    return await this.commandDidRun(args);
  }

  prepareCommand (): void {
    this.command.usage(this.cmdUsage);
    this.command.description(this.description);
    this.command.version(`${this.name}@v${version}`);
    this.command.on('--help', this.printHelp.bind(this));
  }
}

export default BaseCommand;
