// @flow
import BaseCommand, {RearCommand} from './base-command';
import runCommand from 'rear-core/run-command';
import checkIfOnline from 'rear-core/check-if-online';
import shouldUseYarn from 'rear-core/should-use-yarn';

class InstallCommand extends BaseCommand {
  constructor () {
    super({
      name: 'install',
      usage: '',
      aliases: ['i'],
      description: 'Install project dependencies using yarn or NPM'
    });
  }

  async commandDidRun (): Promise<void> {
    const useYarn = shouldUseYarn();
    const isOnline = await checkIfOnline(useYarn);
    const programName = useYarn ? 'yarn' : 'npm';

    const args = ['install'];
    if (!isOnline) args.push('--offline');

    return await runCommand(programName, args);
  }
}

const installCommand: RearCommand = new InstallCommand();
export default installCommand;
