const execSync = require('child_process').execSync;

module.exports = shouldUseYarn;

/////////////////////////////////

function shouldUseYarn () {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}
