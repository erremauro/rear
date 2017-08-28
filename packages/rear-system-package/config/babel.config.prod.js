const path = require('path');
const appPaths = require('./app-paths');

if (path.extname(appPaths.root) !== '') {

}

module.exports = {
  minified: true,
  compact: 'auto',
  comments: false,
  presets: [
    path.join(appPaths.ownNodeModules, 'babel-preset-rear')
  ]
};
