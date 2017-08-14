const fs = require('fs');
const resolveApp = require('./resolve-app');
const {RuntimeModuleNotFound} = require('./errors');

module.exports = runtimeRequire;

//////////////////////////////////

function runtimeRequire (moduleName, realm) {
  try {
    const ownModule = resolveApp('node_modules', moduleName);
    if (fs.existsSync(ownModule)) moduleName = ownModule;
    return require(moduleName);
  } catch (err) {
    if ('MODULE_NOT_FOUND' === err.code) {
      throw new RuntimeModuleNotFound(err, realm);
    }
    throw err;
  }
}
