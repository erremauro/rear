// @flow
import BaseCommand, {RearCommand} from './base-command';
import {runProgram} from '../../operators/program-runner';

class RunCommand extends BaseCommand {
  constructor () {
    super({
      name: 'run',
      aliases: ['r'],
      usage: '<cmd>',
      description: 'Find and run a command',
    });
  }

  commandWillRun (): void {
    this.command.arguments('<cmd> [options...]')
    this.command.action((cmd: string, options: Array<string>) => {
      this.state.commandName = cmd;
      this.state.commandOptions = options;
    });
  }

  async commandDidRun (args: Array<string>): Promise<void> {
    const {commandName, commandOptions} = this.state;

    if (commandName) {
      return await runProgram({
        programName: commandName,
        args: commandOptions,
        reporter: this.reporter
      });
    }
  }

  printHelp () :void {
    const {reporter} = this;

    reporter.log();
    reporter.highlight('  Examples:');
    reporter.log();
    reporter.log('    %crear run test%c\tRun test script from package.json', 'cyan');
    reporter.log('    %crear build%c\t\tRun build script from package.json', 'cyan');
    reporter.log();
  }
}

const runCommand: RearCommand = new RunCommand();
export default runCommand;
