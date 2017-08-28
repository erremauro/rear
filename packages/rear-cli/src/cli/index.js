// @flow
import commander from 'commander';
import commands, {CommandList} from './commands';
import {Reporter} from '../reporter';
import version from '../rear-version';
import printHelpFooter from './utils/print-help-footer';

export async function CLIEngine (args: Array<string>): Promise<void> {
  // TODO: Right now startArgs and endArgs have no purpose
  const doubleDashIndex = args.findIndex(element => element === '--');
  const startArgs = args.slice(0, 2);
  args = args.slice(2, doubleDashIndex === -1 ? args.length : doubleDashIndex);
  const endArgs = doubleDashIndex === -1 ? [] : args.slice(doubleDashIndex);

  commander.usage('[cmd] [options]');
  commander.version(`rear@v${version}`);
  commander.on('--help', printHelp);
  commander.parse([
    ...startArgs,
    ...args,
    ...endArgs
  ]);

  let command;
  let commandName: string = args.shift() || 'help';

  if (commandName === '-v' || commandName === '--version') {
    Reporter.log(`rear@v${version}`);
    return Promise.resolve();
  }

  if (commandName === '--help' || commandName === '-h') {
    commandName = 'help';
  }

  // if no args or command name looks like a flag set command to 'install'
  if (commandName[0] === '-') {
    args.unshift(commandName);
    commandName = 'install';
  }

  // If a command name cannot be found, but args were specified,
  // set the default command to `run` otherwise use the command found.
  if (commands.has(commandName)) {
    command = commands.get(commandName);
  } else if (args.length >= 0) {
    args.unshift(commandName);
    commandName = 'run';
    command = commands.get(commandName);
  }

  // Print the help output by default if no command was specified.
  if (!command || (commandName === 'help' && args.length === 0)) {
    commander.outputHelp();
    return Promise.resolve()
  }

  return await command.run(args);
}

function printHelp (): void {
  Reporter.log();
  Reporter.highlight('  Commands: ');
  Reporter.log();

  let longestCmd = 0;
  let cmds = []

  // create an Array of valid commands while registering
  // the length of the longest command usage description.
  for (const cmd of CommandList) {
    if (cmd.hidden) continue;
    if (longestCmd < cmd.usage.length) longestCmd = cmd.usage.length;
    cmds.push(cmd);
  }

  // Print an aligned list of command usages and descriptions.
  // Calculate the number of spaces (pad) that must be appended to `cmd.usage`
  // in order to correctly align the command list on screen.
  // Usage and description are separated with a double-space
  // on the longest command usage description, therefore with add 1 to
  // the calculated pad length.
  for (const cmd of cmds) {
    let pad = (longestCmd - cmd.usage.length) + 1;

    do {
      cmd.usage += ' ';
      pad--;
    } while (pad >= 0)

    Reporter.log(`    %c${cmd.usage}%c${cmd.description}`, 'cyan', 'reset')
  }

  printHelpFooter(Reporter);
}
