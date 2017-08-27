/** @flow */
import fs from 'fs-extra';
import path from 'path';
import ConsoleOperator from './console-operator';
import config from './config';
import {type ReporterType} from './reporter'
import {CommandNotFound} from './errors';
import {execSync} from 'child_process';
import leven from 'leven';

type ProgramRunnerProps = {
  programName: string,
  args: Array<string>,
  reporter?: ReporterType
}

export class ProgramRunner extends ConsoleOperator {
  props: ProgramRunnerProps;

  constructor (props: ProgramRunnerProps) {
     super(props);
     this.state = {
       binCommands: [],
       scripts: new Map(),
       cmdHints: {},
       cmds: [],
       visistedBinDirs: new Set()
     };
  }

  async run (): Promise<void> {
    await this.initBinCommands();
    await this.initScriptsCommands();

    this.buildCommands();

    await this.execCommand();
  }

  /**
   * Find and execute a program using the defined arguments.
   *
   * @return {Promise}  Resolve on successfull command completion.
   * @throws {CommandNotFound} Thrown when the prop command cannot be found.
   *
   * @see {ProgramRunnerProps}
   */

  async execCommand (): Promise<void> {
    const {programName, args} = this.props;
    const {cmds, scripts} = this.state;

    if (cmds.length) {
      // eslint-disable-next-line
      for (const [stage, cmd] of cmds) {
        this.printHeader(stage);
        return await this.runCommand(cmd, args);
      }
    } else {
      let suggestion;

      for (const commandName of scripts) {
        const steps = leven(commandName, programName);
        if (steps < 2) {
          suggestion = commandName;
        }
      }

      return Promise.reject(
        new CommandNotFound(programName, suggestion)
      );
    }
  }

  async initBinCommands (): Promise<void> {
    const {binDir} = config;
    const {binCommands, scripts} = this.state;
    if (!this.state.visistedBinDirs.has(binDir)) {
      if (await fs.exists(binDir)) {
        const programs = await fs.readdir(binDir);
        for (const name of programs) {
          binCommands.push(name);
          scripts[name] = `"${path.join(binDir, name)}"`;
        }
      }
      this.state.visistedBinDirs.add(binDir);
    }
  }

  async initScriptsCommands () {
    const packageJson = this.getAppPackageJson();

    if (packageJson !== null && packageJson.hasOwnProperty('scripts')) {
      const pkgScripts = packageJson.scripts;
      this.setState({pkgScripts});
      const pkgCommands = Object.keys(pkgScripts).sort();

      for (const cmd of pkgCommands) {
        this.state.cmdHints[cmd] = pkgScripts[cmd] || '';
      }

      this.setState({
        scripts: Object.assign(this.state.scripts, pkgScripts)
      });
    }
  }

  buildCommands (): void {
    const {programName} = this.props;
    const {pkgScripts, scripts, cmds} = this.state;

    if (pkgScripts && programName in pkgScripts) {
      const preCommand = `pre${programName}`;
      const postCommand = `post${programName}`;

      if (preCommand in pkgScripts) {
        cmds.push([preCommand, pkgScripts[preCommand]]);
      }

      cmds.push([programName, scripts[programName]]);

      if (postCommand in pkgScripts) {
        cmds.push([postCommand, pkgScripts[postCommand]]);
      }
    } else if (scripts[programName]) {
      cmds.push([programName, scripts[programName]]);
    }
  }

  async runCommand (
    cmd: string,
    args: Array<string> = [],
    stdio: string = 'inherit'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // TODO: run this.performLifeCycle()
      const cmdArgs = this.joinArgs(args);
      const command = `${cmd} ${cmdArgs}`.trim();

      try {
        execSync(command, { stdio });
        resolve()
      } catch (err) {
        reject(err)
      }
    });
  }

  joinArgs (args: Array<string>): string {
    return args.reduce((joinedArgs, arg) =>
      joinedArgs + ' "' + arg.replace(/"/g, '\\"') + '"', ''
    );
  }

  getAppPackageJson (): Object|null {
    try {
      const packageJson = this.resolveApp('package.json');
      return require(packageJson);
    } catch (err) {
      // ignore MODULE_NOT_FOUND error
    }

    return null;
  }
}

export async function runProgram (programName: string, ...args: Array<string>) {
  const programRunner = new ProgramRunner({programName, args});
  return programRunner.run();
}

export default runProgram;
