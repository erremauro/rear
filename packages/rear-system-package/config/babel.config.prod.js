const path = require('path');
const appPaths = require('./app-paths');

module.exports = {
  minified: true,
  comments: false,
  presets: [
    path.join(appPaths.ownNodeModules, 'babel-preset-env'),
    path.join(appPaths.ownNodeModules, 'babel-preset-es2015'),
    path.join(appPaths.ownNodeModules, 'babel-preset-stage-0'),
    path.join(appPaths.ownNodeModules, 'babel-preset-rear')
  ]
};
