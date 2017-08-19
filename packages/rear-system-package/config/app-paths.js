const fs = require('fs');
const path = require('path');
const resolveApp = require('rear-core/resolve-app');

const ownNodeModules = fs.realpathSync(
  path.join(__dirname, '..', 'node_modules')
);

const AppPaths = {
  ownNodeModules,
  root: resolveApp('src'),
  appIndexJs: resolveApp('src', 'index.js'),
  // TODO: rename to appBuild ?
  dest: resolveApp('lib'),
  eslintConfig: path.join(ownNodeModules, 'eslint-config-rear', 'index.js'),
  flowBin:  path.join(ownNodeModules, 'flow-bin'),
  eslintBin: path.join(ownNodeModules, 'eslint'),
  appNodeModules: resolveApp('node_modules'),
}

module.exports = AppPaths;
