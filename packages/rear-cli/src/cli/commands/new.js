// @flow
import BaseCommand, {RearCommand} from './base-command';
import {createApp} from '../../operators/app-installer';

class NewCommand extends BaseCommand {
  constructor () {
    super({
      name: 'new',
      usage: '<project-name>',
      description: 'Create a new rear project',
    });
  }

  commandWillRun (): void {
    this.command.option(
      '-t, --system-type [type]',
      'use the given system template [package]',
      'package'
    );
    this.command.option(
      '-r, --release [version]',
      'use the specified system template release [latest]'
    );
    this.command.option(
      '-v, --verbose',
      'print additional logs'
    );
    this.command.arguments('<project-name>')
    this.command.action((projectName: string) => {
      this.state.projectName = projectName;
    });
  }

  async commandDidRun (args: Array<string>): Promise<void> {
    const {projectName} = this.state;

    if (projectName) {
      return createApp({
        appName: projectName,
        dependencies: ['rear-core'],
        systemType: this.command.systemType,
        version: this.command.release,
        reporter: this.reporter
      });
    }
    return Promise.resolve();
  }

  printHelp () :void {
    const {reporter} = this;

    reporter.log();
    reporter.highlight('  Examples:');
    reporter.log();
    reporter.log('    %crear new my-app -t client%c\tCreate a new rear client in %c./my-app', 'cyan', 'reset', 'green');
    reporter.log();
  }
}

const newCommand: RearCommand = new NewCommand();
export default newCommand;
