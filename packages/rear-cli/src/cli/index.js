// @flow
import commander from 'commander';
import commands from './commands';
import {Reporter} from '../reporter';
import version from '../rear-version';
import printHelpInfo from './utils/print-help-info';

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
  let commandName: string = args.shift();

  if (commandName === '-v' || commandName === '--version') {
    Reporter.log(`rear@v${version}`);
    return Promise.resolve();
  }

  if (commandName === '--help' || commandName === '-h') {
    commandName = 'help';
  }

  // if no args or command name looks like a flag do not set a command
  if (commandName[0] === '-') {
    args.unshift(commandName);
  }

  // If a command name cannot be found, but args were specified,
  // set the default command to `run` otherwise use the command found.
  if (commands.hasOwnProperty(commandName)) {
    command = commands[commandName];
  } else if (args.length >= 0) {
    args.unshift(commandName);
    commandName = 'run';
    command = commands[commandName];
  }

  if (!command || (commandName === 'help' && args.length === 0)) {
    commander.outputHelp();
    return Promise.resolve()
  }

  return command.run(args);
}

function printHelp (): void {
  Reporter.log();
  Reporter.highlight('  Commands: ');
  Reporter.log();

  let longestCmd = 0;
  let cmds = []

  for (const commandName in commands) {
    if (!commands.hasOwnProperty(commandName)) continue;

    const cmd = commands[commandName];
    if (longestCmd < cmd.usage.length) longestCmd = cmd.usage.length;
    cmds.push(cmd);
  }

  for (const cmd of cmds) {
    // calculate the number of spaces to append to usage
    // in order to correctly align all commands with a double-space
    // separation between usage and description.
    let pad = (longestCmd - cmd.usage.length) + 1;

    do {
      cmd.usage += ' ';
      pad--;
    } while (pad >= 0)

    Reporter.log(`    %c${cmd.usage}%c${cmd.description}`, 'cyan', 'reset')
  }

  printHelpInfo(Reporter);
}
