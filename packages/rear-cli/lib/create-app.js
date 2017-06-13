const logger = require('rear-logger')('rear-server');
const shouldUseYarn = require('rear-core/should-use-yarn');
const checkAppName = require('./check-app-name');
const pkgUtils = require('./package-utils');
const cleanGeneratedFiles = require('./clean-generated-files');
const checkIfOnline = require('./check-if-online');

module.exports = createApp;

/////////////////////////////

/**
 * Create a rear app.
 *
 * @param  {string}        programName Name of the running program.
 * @param  {string}        appName     Application name.
 * @param  {Array<string>} deps        Required dependencies.
 * @param  {?boolean}      verbose     Use extended output.
 * @param  {?string}       version     Scripts version to be used.
 * @param  {?string}       template    Custom templated directory path.
 *
 * @return {void}
 */

function createApp(programName, appName, deps, verbose, version, template) {
  const root = checkAppName(programName, appName, deps);

  logger.info(`Creating a new %c${programName} %cin %c${root}`,
    'cyan', 'white', 'green');

  pkgUtils.initPackageJson(appName, root);

  const originDir = process.cwd();
  process.chdir(root);

  const useYarn = shouldUseYarn();
  run(root, appName, deps, originDir, verbose, version, useYarn, template);
}

/**
 * Create a rear app.
 *
 * @param  {string}        root        Application target path.
 * @param  {string}        appName     Application name.
 * @param  {Array<string>} deps        Required dependencies.
 * @param  {string}        origin      App parent directory.
 * @param  {?boolean}      verbose     Use extended output.
 * @param  {?string}       version     Scripts version to be used.
 * @param  {?boolean}      useYarn     Define if yarn should be used.
 * @param  {?string}       template    Custom templated directory path.
 *
 * @return {void}
 */

function run(root, appName, deps, origin, verbose, version, useYarn, template) {
  const scriptPackage = deps[0];
  const installPackage = pkgUtils.getInstallPackage(scriptPackage, version);
  deps[0] = installPackage;

  logger.info('Installing packages. This might take a while.');

  pkgUtils
    .getPackageName(installPackage)
    .then((packageName) => {
      return checkIfOnline(useYarn)
          .then((isOnline) => ({
            isOnline: isOnline,
            packageName: packageName
          }));
      }
    )
    .then(({isOnline, packageName}) => {
      const allPackageNames = deps.join(', ');
      logger.info(`Installing %c${allPackageNames}%c...`, 'cyan', 'white');

      return pkgUtils
        .install(useYarn, deps, verbose, isOnline)
        .then(() => packageName);
    })
    .then(packageName => {
      const scriptsPath = path.resolve(
        process.cwd(),
        'node_modules',
        packageName,
        'scripts',
        'init.js'
      );
      const init = require(scriptsPath);
      init(root, appName, verbose, origin, template);
    })
    .catch((reason) => {
      logger.warn('Aborting installation.');
      if (reason.command) {
        logger.error(`${reason.command} has failed.`)
      } else {
        logger.error('Unexpected error. Please report it as a bug:');
        logger.error(reason);
      }

      cleanGeneratedFiles(root, appName);
      logger.info('Done.');
      process.exit(1);
    });
}
