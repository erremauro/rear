// @flow
import BaseCommand, {RearCommand} from './base-command';
import printHelpInfo from '../utils/print-help-info';

class HelpCommand extends BaseCommand {
  constructor () {
    super({
      name: 'help',
      usage: '[cmd]',
      description: 'Print command help'
    });
  }

  commandWillRun () {
    this.command.arguments('[cmd]')
    this.command.action((cmd: string) => {
      this.state.commandName = cmd;
    });
  }

  async commandDidRun (args: Array<string>): Promise<void> {
    const {commandName} = this.state;
    let rearCommand;

    try {
      const {Commands} = require('./index');
      rearCommand = Commands[commandName];
    } catch (err) {
      return Promise.reject(err);
    }

    if (rearCommand) {
      rearCommand.prepareCommand();
      rearCommand.commandWillRun();
      rearCommand.command.outputHelp();
      printHelpInfo(this.reporter);
    }

    return Promise.resolve();
  }
}

const helpCommand: RearCommand = new HelpCommand();
export default helpCommand;
