// @flow
import {RearCommand} from './base-command';
import runCommand from './run';
import newCommand from './new';
import helpCommand from './help';

export type CommandsType = {
  run: RearCommand,
  new: RearCommand,
  help: RearCommand,
};

export const Commands: CommandsType = {
  run: runCommand,
  new: newCommand,
  help: helpCommand,
};

export default Commands;
