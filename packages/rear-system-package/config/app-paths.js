const fs = require('fs');
const path = require('path');
const env = require('rear-core/get-rear-env')();
const resolveApp = require('rear-core/resolve-app');

let ownNodeModules;

try {
  // Since this package is also used to build other packages
  // in this repo, we need to make sure its dependencies
  // are available when is symlinked by lerna.
  // Normally, modules are resolved from the app's node_modules.
  ownNodeModules = fs.realpathSync(
    path.join(__dirname, '..', 'node_modules')
  );
} catch (err) {
  ownNodeModules = resolveApp('node_modules');
}

const ROOT = path.resolve(env.REAR_SYSTEM_PACKAGE_ROOT) || resolveApp('src');
const DEST = path.resolve(env.REAR_SYSTEM_PACKAGE_DEST) || resolveApp('lib');
const AppPaths = {
  ownNodeModules,
  root: ROOT,
  indexJs: path.join(ROOT, 'index.js'),
  dest: DEST,
  eslintConfig: path.join(ownNodeModules, 'eslint-config-rear', 'index.js'),
  flowBin:  path.join(ownNodeModules, 'flow-bin'),
  eslintBin: path.join(ownNodeModules, 'eslint'),
  appNodeModules: resolveApp('node_modules'),
}

module.exports = AppPaths;
