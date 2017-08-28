// @flow
import BaseCommand, {RearCommand} from './base-command';
import printHelpFooter from '../utils/print-help-footer';

class HelpCommand extends BaseCommand {
  constructor () {
    super({
      name: 'help',
      usage: '[cmd]',
      aliases: ['h'],
      hidden: true,
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
      rearCommand = Commands.get(commandName);
    } catch (err) {
      return Promise.reject(err);
    }

    if (rearCommand) {
      // we need to call `prepareCommand` manually to kickstart the commander's
      // Command initialization and then `commandWillRun` to add any custom
      // option or argument to the help output, that was specified in
      // an extended RearCommad.
      rearCommand.prepareCommand();
      rearCommand.commandWillRun();
      rearCommand.command.outputHelp();
      printHelpFooter(this.reporter);
    }

    return Promise.resolve();
  }
}

const helpCommand: RearCommand = new HelpCommand();
export default helpCommand;
