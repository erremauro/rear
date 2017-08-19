#!/usr/bin/env node
process.env.NODE_ENV='development';
process.env.BABEL_ENV='development';

const fs = require('fs-extra');
const path = require('path');
const packageJson = require('../package.json');
const env = require('rear-core/get-rear-env')();
const appPackageJson = require('rear-core/get-package-json')();
const transformConfig = require('../config/transform-config');
const Builder = require('../lib/Builder');

let builder;

module.exports = build;
if (require.main === module) Main()

//////////////////////////////////////

function Main () {
  const logger = require('rear-logger')('rear-scripts-package:start');
  const appPaths = require('../config/app-paths');

  build(appPaths, logger);
}

function build (appPaths, reporter) {
  fs.ensureDirSync(appPaths.dest);

  const eslintBin    = appPackageJson.eslintConfig
      ? null // use the appPackage eslint dependency
      : appPaths.eslintBin;
  const eslintConfig = appPackageJson.eslintConfig
      ? appPackageJson
      : appPaths.eslintConfig

  builder = new Builder({
    reporter,
    transformConfig,
    eslintConfig,
    eslintBin,
    flowBin: appPaths.flowBin,
    root: appPaths.root,
    dest: appPaths.dest,
    watch: true,
    webpack: env.REAR_SYSTEM_PACKAGE_WEBPACK === 'true'
  });

  builder.on('start', handleStart);
  builder.on('lint', handleLint);
  builder.on('typecheck', handleTypecheck);
  builder.on('transform', handleTransform);
  builder.on('close', handleClose);
  builder.on('error', handleError);

  process.on('SIGINT', handleQuit);
  process.on('SIGTERM', handleQuit);

  builder.build();
}

function handleLint () {
  this.reporter.clear();
  this.reporter.log('%c[1/3]%c :sleuth_or_spy: '
      + 'Linting...', 'gray', 'white');
}

function handleTypecheck () {
  this.reporter.clear();
  this.reporter.log('%c[2/3]%c :left_pointing_magnifying_glass: '
      + 'Typechecking...', 'gray', 'white');
}

function handleTransform () {
  this.reporter.clear();
  this.reporter.log('%c[3/3]%c :package: Compiling...', 'gray', 'white');
}

function handleStart () {
  this.reporter.hideCursor();
  this.reporter.highlight(`${packageJson.name} start v${packageJson.version}`);
  this.reporter.info(`Building %c${appPackageJson.name}`, 'green');
}

function handleClose (stats) {
  const relativeDest = path.relative(process.cwd(), this.props.dest);
  const lastRun = new Date(stats.timer.end)
      .toTimeString()
      .replace(/GMT.*/, '');

  this.reporter.clear();
  this.reporter.log(
    `%cYour ${process.env.NODE_ENV} build is ready at %c./${relativeDest}`,
    'green', 'blue_underline'
  );
  this.reporter.log();
  this.reporter.log(
    `  %cSize:\t\t%c${stats.size.sign}${stats.size.diff.toString('k')}`,
    'bold', 'reset'
  );
  this.reporter.log(`  %cTime:\t\t%c${stats.timer.toString('s')}`, 'bold', 'reset');
  this.reporter.log(`  %cLast build:\t%c${lastRun}`, 'bold', 'reset');
  this.reporter.log();
  this.reporter.log('\nPress %cCTRL+C%c to stop.', 'yellow', 'reset');
}

function handleError (err) {
  if (!err) return;

  this.reporter.error(err);
  this.reporter.showCursor();

  process.exit(err.code);
}

function handleQuit () {
  builder.reporter.clearLine();
  builder.reporter.log();
  builder.reporter.quit('Stopped.');
  builder.reporter.showCursor();
  process.exit(0);
}
