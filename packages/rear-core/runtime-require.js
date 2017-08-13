const {RuntimeModuleNotFound} = require('./errors');

module.exports = runtimeRequire;

//////////////////////////////////

function runtimeRequire (moduleName, realm) {
  try {
    return require(moduleName);
  } catch (err) {
    if ('MODULE_NOT_FOUND' === err.code) {
      throw new RuntimeModuleNotFound(err, realm);
    }
    throw err;
  }
}
