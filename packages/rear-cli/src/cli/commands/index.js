// @flow
import {RearCommand} from './base-command';
import runCommand from './run';
import newCommand from './new';
import helpCommand from './help';
import installCommand from './install';

// Rear commands, sorted by command name.
export const CommandList: Array<RearCommand> = [
  runCommand,
  newCommand,
  helpCommand,
  installCommand
].sort(
  (a: RearCommand, b: RearCommand) => a.name.localeCompare(b.name)
);

// Rear commands key/value Map with names and aliases keys.
export const Commands: Map<RearCommand> = new Map();

for (const command of CommandList) {
  Commands.set(command.name, command);
  for (const alias of command.aliases) {
    Commands.set(alias, command);
  }
}

export default Commands;
