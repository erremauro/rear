const execSync = require('child_process').execSync;

function shouldUseYarn() {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = shouldUseYarn;
