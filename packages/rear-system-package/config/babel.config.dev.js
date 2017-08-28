const path = require('path');
const appPaths = require('./app-paths');

module.exports = {
  minified: false,
  compact: false,
  comments: false,
  presets: [
    path.join(appPaths.ownNodeModules, 'babel-preset-rear')
  ]
};
