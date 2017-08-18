const fs = require('fs');
const path = require('path');
const logger = require('rear-logger')('bootstrap');
const { execSync, spawn } = require('child_process');
const shouldUseYarn = require('../packages/rear-core/should-use-yarn');
const isWindows = process.platform === 'win32';

module.exports = __filename;
if (require.main === module) Main();

///////////////////////////////////////

function Main() {
  const lerna = requireLerna();
  const useYarn = shouldUseYarn();

  if (!lerna) {
    if (useYarn) {
      logger.error(
        'Lerna cannot not be found. Please run `yarn --check-files`.'
      );
    } else {
      logger.error('Lerna cannot not be found.');
      logger.hint('Remove `node_modules` and run `npm install` again.');
    }

    process.exit(1);
  }

  const args = ['bootstrap'];

  if (useYarn) {
    args.push('--npm-client=yarn');
    // yarn doesn't support concurrency
    args.push('--concurrency=1');
  } else {
    // windows doesn't handle concurrency too well
    if (isWindows || !shouldUseNpmWithConcurrency()) {
      args.push('--concurrency=1');
    }
  }

  child = spawn(lerna, args, { stdio: 'inherit' });
  child.on('close', code => process.exit(code));
}

function shouldUseNpmWithConcurrency() {
  try {
    const versionString = execSync('npm --version');
    const matches = /^(\d+)[.]/.exec(versionString);
    // Concurrent installs are supported only sice NPM >= 5
    return Number(matches[1]) >= 5;
  } catch (e) {
    return false;
  }
}

function requireLerna() {
  const lernaCmd = isWindows ? 'lerna.cmd' : 'lerna';
  const lerna = path.resolve(__dirname, '../node_modules', '.bin', lernaCmd);
  if (fs.existsSync(lerna)) return lerna;
  return null;
}
