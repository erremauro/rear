/** @flow */
import fs from 'fs-extra';
import path from 'path';
import dns from 'dns';
import {execSync} from 'child_process';
import tmp from 'tmp';
import spawn from 'cross-spawn';
import hyperquest from 'hyperquest';
import {unpack} from 'tar-pack';
import semver from 'semver';
import validateNpmName from 'validate-npm-package-name';
import ConsoleOperator from './console-operator';
import {ReporterType} from './reporter';
import SystemTypes, {type SystemType} from './system-types';
import {
  KNOWN_GENERATED_FILES,
  NODE_MIN_VERSION,
  NPM_MIN_VERSION,
  VALID_FILES
} from './constants';
import {
  AppNameConflict,
  CommandFailure,
  DirectoryConflict,
  InvalidNpmName,
  InvalidVersion,
  TemplateNotFound
} from './errors';

type InstallerOpts = {
  appName: string,
  systemType: SystemType,
  dependencies?: Array<string>,
  programName?: string,
  reporter?: ReporterType,
  verbose?: boolean,
  version?: string,
}

type InstallerProps = {
  appName: string,
  dependencies: Array<string>,
  programName: string,
  reporter: ReporterType,
  systemType: SystemType,
  verbose: boolean,
  version: string,
};

type VersionCheckResults = {
  hasMinVersion: boolean,
  version: string
};

type CommandDefinition = {
  command: string,
  args: Array<any>
}

export class AppInstaller extends ConsoleOperator {
  static defaultProps = {
    programName: 'rear',
    verbose: false,
    version: '',
    dependencies: []
  };

  props: InstallerProps;
  reporter: ReporterType;
  state: Object;
  // having `execSync` and `dns.lookup` exposed as class properties
  // makes them easily mockable in a test.
  execSync: Function;
  dnsLookup: Function;
  spawn: Function;

  constructor (props: InstallerOpts) {
    super(props, AppInstaller.defaultProps);
    this.state = { root: null, origin: null };
    this.execSync = execSync;
    this.dnsLookup = dns.lookup;
    this.spawn = spawn;
  }

  async createApp (): Promise<void> {
    try {
      this.checkAppName();
    } catch (err) {
      this.reporter.error(err.message);
      if (err instanceof AppNameConflict) {
        this.reporter.info(
          `Due to the way npm works, the following names are not allowed:\n\n`
        );
        err.dependencies.forEach(depName => {
          this.reporter.log(`  %c${depName}`, 'cyan');
        });
      }
      throw err;
    }

    this.setState({ root: this.resolveApp(this.props.appName) });

    this.reporter.info(
      `Creating a new %c${this.props.programName} ${this.props.systemType} `
        + `%cin %c${this.state.root}`,
      'cyan', 'white', 'green'
    );

    try {
      this.checkVersions();
    } catch (err) {
      this.reporter.error(err.message);
      if (err instanceof InvalidVersion) {
        this.reporter.info(
          `Please update to ${err.props.program} ${err.props.minVersion} `
            + `or higher.`
        );
      }
      throw err;
    }

    try {
      this.checkProjectDir(this.state.root);
    } catch (err) {
      this.reporter.error(err.message);
      if (err instanceof DirectoryConflict) {
        this.reporter.log();
        for (const file of err.conflicts) {
          this.reporter.log(`  - ${file}`);
        }
        this.reporter.log();
        this.reporter.hint(
          'Either try using a new directory name, or remove the files '
              + 'listed above.'
        );
      }
      throw err;
    }

    this.initWithPackageJson(this.props.appName, this.state.root);
    this.setState({ origin: process.cwd() });
    process.chdir(this.state.root);

    try {
      await this.run();
      this.reporter.log(`:rocket: Created %c${this.props.appName}`, 'green')
      const installCmd = this.shouldUseYarn() ? `yarn install` : `npm install`
      this.reporter.info(
        `Now you can run %ccd ./${this.props.appName} && ${installCmd}`,
        'yellow'
      );
      this.reporter.log();
    } catch (err) {
      this.reporter.log();
      this.reporter.warn('Aborting installation.');

      if (err instanceof InvalidVersion && err.program === 'node') {
        this.reporter.error(
          `You are running Node ${err.version} `
              + `while ${err.props.packageName} requires Node ${err.minVersion}.`
        );
        this.reporter.hint('Please update your version of Node.');
      }

      this.reporter.error(err.message);
      this.reporter.log();

      // clean-up generated files...
      this.cleanup(this.state.root);
    }
  }

  /**
   * @private
   *
   * Resolve the correct system package name, install the package locally
   * and run the system initialization.
   *
   * @return {Promise<void>}
   *
   * @throws {InvalidVersion}   If the running node version is unsupported
   * @throws {TemplateNotFound} If the system template cannot be found
   */

  async run (): Promise<void> {
    const {systemType, version} = this.props;
    const packageToInstall = this.getInstallPackage(systemType, version);
    await this.installPackage(
      packageToInstall,
      this.state.root,
      this.state.origin
    );
  }

  checkAppName (): boolean {
    const {appName, dependencies} = this.props;
    const validationResults = validateNpmName(appName);

    if (!validationResults.validForNewPackages) {
      throw new InvalidNpmName(`${appName} is not a valid npm package name.`);
    }

    // app name must not conflict with existing dependencie's name
    if (dependencies.indexOf(appName) >= 0) {
      throw new AppNameConflict(`Cannot create a project named ${appName}: `
        + `a dependency with the same name already exists.`,
        {dependencies}
      );
    }
    return true;
  }

  checkVersions (): boolean {
    const nodeInfo = this.validateNodeVersion(NODE_MIN_VERSION);
    if (!nodeInfo.hasMinVersion) {
      throw new InvalidVersion({
        program: 'node',
        minVersion: NODE_MIN_VERSION,
        version: nodeInfo.version
      });
    }

    if (!this.shouldUseYarn()) {
      const npmInfo = this.validateNpmVersion(NPM_MIN_VERSION);
      if (!npmInfo.hasMinVersion) {
        throw new InvalidVersion({
          program: 'Npm',
          minVersion: NPM_MIN_VERSION,
          version: npmInfo.version
        });
      }
    }
    return true;
  }

  getInstallPackage (systemType: SystemType, version: string): string {
    let packageToInstall;

    const appSystem    = 'rear-system-app';
    const clientSystem = 'rear-system-client';
    const serverSystem = 'rear-system-server';
    const packageSystem = 'rear-system-package';

    switch (systemType) {
      case SystemTypes.app:
        packageToInstall = appSystem;
        this.setProps({
          dependencies: this.props.dependencies.concat([
            clientSystem,
            serverSystem
          ])
        });
        break;
      case SystemTypes.server:
        packageToInstall = serverSystem;
        break;
      case SystemTypes.package:
        packageToInstall = packageSystem;
        break;
      default:
        packageToInstall = clientSystem;
        break;
    }

    let validSemver;
    const validVersionNames = ['latest', 'next'];

    if (validVersionNames.includes(version)) {
      validSemver = version;
    } else {
      validSemver = semver.valid(version);
    }

    if (validSemver) {
      packageToInstall += `@${validSemver}`;
    } else if (version) {
      // for tar.gz or alternative paths
      packageToInstall = version;
    }

    this.setProps({
      dependencies: this.props.dependencies.concat(packageToInstall)
    });
    return packageToInstall;
  }

  async installPackage (
    packageToInstall: string,
    destination: string,
    origin: string
  ): Promise<void> {
    const packageName = await this.getPackageName(packageToInstall)
    this.reporter.info(
      `Installing %c${packageName}%c...`, 'cyan', 'white'
    );
    await this.install();
    await this.checkNodeVersion(packageName);
    return await this.init(packageName);
  }

  /**
   * @private
   *
   * Initialize and copy the system template after the install.
   *
   * @param  {string} packageName Name of the system installed
   * @return {void}
   *
   * @throws {TemplateNotFound}
   *
   * @see AppInstaller#installPackage
   *
   * TODO: Run pre and post install operation via template's init script
   * (template init script should be optional)
   */

  init (packageName: string): void {
    const appPath = this.resolveApp(this.props.appName);
    const sysRootPath = path.join(appPath, 'node_modules', packageName);
    const templatePath = path.join(sysRootPath, 'template');

    if (!fs.existsSync(templatePath)) {
      throw new TemplateNotFound(packageName, templatePath);
    }

    // If a README file already exists in the app root, rename it
    const readmePath = this.resolveApp('README.md');
    if (fs.existsSync(readmePath)) {
      fs.copySync(readmePath, this.resolveApp('README.old.md'));
    }

    // Copy the template content to the app root
    fs.copySync(templatePath, this.state.root);

    // Merge package.json and .template.json
    const appPackagePath = path.join(appPath, 'package.json');
    const sysPackagePath = path.join(appPath, '.template.json');

    if (fs.existsSync(sysPackagePath)) {
      const sysPackageJson = require(sysPackagePath);
      const appPackageJson = require(appPackagePath);
      const newPackageJson = Object.assign(appPackageJson, sysPackageJson);
      fs.writeFileSync(appPackagePath, JSON.stringify(newPackageJson, null, 2));
      fs.removeSync(sysPackagePath);
    }

    // .gitignore is renamed to .npmignore by npm, so it must be shipped
    // as "gitignore" and renamed during the install.
    const appGitignore = path.join(appPath, 'gitignore');
    const appDotGitignore = path.join(appPath, '.gitignore');

    try {
      fs.moveSync(appGitignore, appDotGitignore);
    } catch (err) {
      if (err.code === 'EEXIST') {
        // if a .gitignore already exists, copy only the content
        const gitignoreContent = fs.readFileSync(appGitignore);
        fs.appendFileSync(appDotGitignore, gitignoreContent);
        fs.removeSync(appGitignore);
      } else {
        throw err;
      }
    }
  }

  /**
   * @private
   *
   * Install all dependencies in `props` using yarn (if available) or npm.
   *
   * @return {Promise<void>}  Resolve on successfull install process completion.
   * @throws {CommandFailure} Thrown when install command exit with an error.
   *
   * @see AppInstaller#installPackage
   */

  async install (): Promise<void> {
    const isOnline = await this.checkIfOnline();
    const {command, args} = this.getCommand(
      this.props.dependencies,
      this.shouldUseYarn(),
      this.props.verbose,
      isOnline
    );
    await this.runCommand(command, args);
  }

  /**
   * @private
   *
   * Run a command and waits until is ended.
   *
   * @param  {string}         command Command to run
   * @param  {Array<string>}  args    Command arguments
   * @param  {string}        [stdio]  Use 'ignore' to hide output
   * @return {Promise}                Resolve on child process close.
   *
   * @throws {CommandFailure}         Thrown when command exit with an error.
   */

  async runCommand (
    command: string,
    args: Array<any>,
    stdio: string = 'inherit'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = this.spawn(command, args, { stdio });
      proc.on('close', code => {
        if (code !== 0) {
          reject(new CommandFailure({
            command: `${command} ${args.join(' ')}`
          }));
        }
        resolve();
      });
    });
  }

  /**
   * @private
   *
   * Get `command` and `args` for yarn or npm with all the required flag
   * parameters (i.e. '--save') to install the given `dependencies`.
   *
   * @param  {Array<string>}  dependencies A list of packages to install
   * @param  {boolean}        useYarn      Use yarn or npm
   * @param  {boolean}        verbose      Print additional logs
   * @param  {boolean}        isOnline     Define yarn offline installation
   * @return {CommandDefinition}           Command and arguments object.
   */

  getCommand (
    dependencies: Array<string>,
    useYarn: boolean,
    verbose: boolean,
    isOnline: boolean
  ): CommandDefinition {
    let command, args;

    if (useYarn) {
      command = 'yarnpkg';
      args = ['add', '--exact'];
      if (!isOnline) {
        this.reporter.warn(
          'You appear to be offline. Falling back to the local Yarn cache.'
        );
        args.push('--offline');
      }
    } else {
      command = 'npm';
      args = ['install', '--save', '--save-exact'];
    }

    args = args.concat(dependencies || []);
    if (verbose) args.push('--verbose');

    return {command, args};
  }

  /**
   * @private
   *
   * Resolve a package name (without version) from name,
   * local and remote  .tgz archives or a git repository url.
   *
   * @param  {string}  installPackage Package to install.
   * @return {Promise<string>} The resolved package name.
   */

  async getPackageName (installPackage: string): Promise<string> {
    if (installPackage.indexOf('.tgz') > -1) {
      let tmp;

      try {
        tmp = await this.getTemporaryDirectory();
        const stream = /^http/.test(installPackage)
          ? hyperquest(installPackage)
          : fs.createReadStream(installPackage);
        const tmpDir = await this.extractStream(stream, tmp.tmpdir);
        const packageName = require(path.join(tmpDir, 'package.json')).name;
        return Promise.resolve(packageName);
      } catch(err) {
        // The package name could be with or without semver version, e.g. react-scripts-0.2.0-alpha.1.tgz
        // However, this function returns package name only without semver version.
        this.reporter.warn(
          `Could not extract the package name from the archive: ${err.message}`
        );
        const matches = installPackage.match(/^.+\/(.+?)(?:-\d+.+)?\.tgz$/)
        if (Array.isArray(matches) && matches.length > 1) {
          const assumedProjectName = matches[1];
          this.reporter.info(
            `Based on the filename, assuming it is "%c${assumedProjectName}%C"`,
            'cyan', 'white'
          );
          if (typeof tmp !== 'undefined') tmp.cleanup();
          return Promise.resolve(assumedProjectName);
        }

        if (typeof tmp !== 'undefined') tmp.cleanup();
        return Promise.reject('Unable to resolve project name from package.');
      }
    }

    if (installPackage.indexOf('git+') === 0) {
      // Pull package name out of git urls e.g:
      // git+https://github.com/mycompany/react-scripts.git
      // git+ssh://github.com/mycompany/react-scripts.git#v1.2.3
      const matches = installPackage.match(/([^/]+)\.git(#.*)?$/);
      if (Array.isArray(matches) && matches.length > 1) {
        const packageName = matches[1];
        return Promise.resolve(packageName);
      }
      return Promise.reject('Unable to resolve package name from git repository.');
    }

    if (installPackage.match(/.+@/)) {
      // Do not match @scope/ when stripping off @version or @tag
      return Promise.resolve(
        installPackage.charAt(0) + installPackage.substr(1).split('@')[0]
      );
    }

    return Promise.resolve(installPackage);
  }

  cleanup (directory: string): void {
    let currentFiles;

    try {
      currentFiles = fs.readdirSync(path.join(directory));
    } catch (err) {
      if (err.code === 'ENOENT') return;
      throw err;
    }

    currentFiles.forEach(file => {
      KNOWN_GENERATED_FILES.forEach(fileToMatch => {
        if (
          (fileToMatch.match(/.log/g) && file.indexOf(fileToMatch) === 0) ||
          file === fileToMatch
        ) {
          this.reporter.info(`Deleting generated file... %c${file}`, 'cyan');
          fs.removeSync(path.join(directory, file));
        }
      });
      const remainingFiles = fs.readdirSync(path.join(directory));
      if (!remainingFiles.length) {
        // Delete target folder if empty
        this.reporter.info(
          `Deleting %c${this.props.appName} /%c from `
              + `%c${path.resolve(directory, '..')}`,
          'cyan', 'white', 'cyan'
        );
        process.chdir(path.resolve(directory, '..'));
        fs.removeSync(path.join(directory));
      }
    });
  }

  async extractStream (stream: stream$Readable, dest: string): Promise<string> {
    return new Promise((resolve, reject) => {
      stream.pipe(
        unpack(dest, err => {
          if (err) {
            reject(err);
          } else {
            resolve(dest);
          }
        })
      );
    });
  }

  async getTemporaryDirectory (): Promise<Object> {
    return new Promise((resolve, reject) => {
      // Unsafe cleanup lets us recursively delete the directory if it contains
      // contents; by default it only allows removal if it's empty
      tmp.dir({ unsafeCleanup: true }, (err, tmpdir, callback) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            tmpdir: tmpdir,
            cleanup: () => {
              try {
                callback();
              } catch (ignored) {
                // Callback might throw and fail, since it's a temp directory the
                // OS will clean it up eventually...
              }
            },
          });
        }
      });
    });
  }

  async checkIfOnline (): Promise<boolean> {
    if (!this.shouldUseYarn()) {
      // Don't ping the Yarn registry.
      // We'll just assume the best case.
      return Promise.resolve(true);
    }

    return new Promise(resolve => {
      this.dnsLookup('registry.yarnpkg.com', err => {
        resolve(err === null);
      });
    });
  }

  initWithPackageJson (appName: string, root: string): void {
    fs.ensureDirSync(root);

    const packageJson = {
      name: appName,
      version: '0.1.0',
      private: true
    };

    fs.writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
  }

  checkProjectDir (root: string): boolean {
    let conflicts;

    try {
      conflicts = fs.readdirSync(root)
        .filter(file => !VALID_FILES.includes(file));
    } catch (err) {
      if (err.code === 'ENOENT') {
        return true;
      }
      throw err;
    }

    if (conflicts.length === 0) return true;

    throw new DirectoryConflict(
      `The directory ${root} contains files that could conflict`,
      {
        directory: root,
        conflicts
      }
    );
  }

  /**
   * @private
   *
   * Check that the installed package can support the running node engine.
   *
   * @param  {string} packageName The name of the installed system
   * @return {void}
   *
   * @throws {InvalidVersion} When an unsupported node version is found
   */

  checkNodeVersion (packageName: string): void {
    const packageJsonPath = this.resolveApp(
      this.props.appName,
      'node_modules',
      packageName,
      'package.json'
    );
    const packageJson = require(packageJsonPath);
    if (!packageJson.engines || !packageJson.engines.node) {
      return;
    }

    const {version} = process;
    const minVersion = packageJson.engines.node;

    if (!semver.satisfies(process.version, packageJson.engines.node)) {
      throw new InvalidVersion({
        program: 'Node',
        minVersion,
        version,
        packageName
      });
    }
  }

  validateNodeVersion (minVersion: string): VersionCheckResults {
    const hasMinVersion = semver.satisfies(process.version, '>=' + minVersion);
    const version = process.version;

    return {
      hasMinVersion,
      version
    }
  }

  validateNpmVersion (minVersion: string): VersionCheckResults {
    let hasMinVersion = false;
    let version = 'unknown';

    try {
      version = this.execSync('npm --version').toString().trim();
      hasMinVersion = semver.gte(version, minVersion);
    } catch (err) {
      // ignore
    }
    return {
      hasMinVersion,
      version,
    };
  }

  shouldUseYarn (): boolean {
    if (!this.state.useYarn) {
      try {
        this.setState({ useYarn: fs.existsSync('yarn.lock') });
      } catch (err) {
        this.setState({ useYarn: false });
      }
    }

    return this.state.useYarn;
  }
}

export async function createApp (props: InstallerOpts): Promise<void> {
  const installer = new AppInstaller(props);
  return installer.createApp();
}

export default createApp;
