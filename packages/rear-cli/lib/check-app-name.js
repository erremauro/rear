const fs = require('fs-extra');
const validateNpmName = require('validate-npm-package-name');
const resolveApp = require('rear-core/resolve-app');
const logger = require('rear-logger')('checkAppName');

module.exports = checkAppName;

///////////////////////////////

function checkAppName(programName, appName, dependencies) {
  if (typeof appName !== 'string') {
    logger.error('Please specify the project name.');
    logger.log();
    logger.log(`For example: \n  %c${programName}%c awesomeProject\n`, 'cyan', 'green');
    logger.info(`Run %c${programName} --help %cto see all options`, 'white_bold', 'white');
    process.exit(1);
  }

  const validationResults = validateNpmName(appName);
  if (!validationResults.validForNewPackages) {
    logger.error(`%c${appName}%c is not a valid npm package name.`, 'cyan', 'white');
    logger.info('Please choose a different name.');
    process.exit(1);
  }

  if (!dependencies) dependencies = [];
  if (dependencies.indexOf(appName) >= 0) {
    logger.error(`Cannot create project named %c${appName}%c: a dependency with the same name already exists.\n`, 'green', 'white');
    logger.warn('The following names are not allowed:');
    dependencies.map(depName => {
      logger.log('  - ' + depName);
    });
    logger.log();
    logger.info('Please choose a different app name.');
    process.exit(1);
  }

  fs.ensureDirSync(appName);

  const root = resolveApp(appName);
  if (!isSafeProjectDir(root)) {
    logger.error(`The directory %c${root}%c contains files that could conflict.`, 'green', 'white');
    logger.info('Please choose a different app name.');
    process.exit(1);
  }

  return root;
}

function isSafeProjectDir(root) {
  const validFiles = [
    '.DS_Store',
    'Thumbs.db',
    '.git',
    '.gitignore',
    '.idea',
    'README.md',
    'LICENSE',
    'web.iml',
    '.hg',
    '.hgignore',
    '.hgcheck',
  ];
  return fs.readdirSync(root).every(file => validFiles.indexOf(file) >= 0);
}
