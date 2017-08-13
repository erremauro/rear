const fs = require('fs-extra');
const path = require('path');
const runtimeRequire = require('./runtime-require');
const babel = runtimeRequire('babel-core', __filename);

const BABEL_CONFIG = {
  comments: false,
  compact: true
};

module.exports = transpile;

/////////////////////////////

/**
 * Transpile options.
 * @typedef {Object} TranspileOpts
 *
 * @property {Object} babelOptions  Babel options object for transpiling.
 * @property {string} src           The source directory path.
 * @property {string} dest          The destination directory path.
 */

/**
 * Transpile a javascript source file with babel to a destination directory
 * @async
 *
 * @param  {TranspileOpts} opts   babelOptions, src and dest parameters
 * @return {Promise<string>}      Resolve with the name of the transpiled file
 */

function transpile (opts) {
  const babelOptions = Object.assign({}, BABEL_CONFIG, opts.babelOptions);
  return new Promise((resolve, reject) => {
    babel.transformFile(opts.file, babelOptions, (err, result) => {
      if (err) return reject(err);

      const destFile = opts.file.replace(opts.src, opts.dest);
      const destDir = path.dirname(destFile);

      fs.ensureDir(destDir, (err) => {
        if (err) return reject(err);
        fs.writeFile(destFile, result.code, (err) => {
          if (err) return reject(err)
          resolve(destFile);
        });
      });
    });
  });
}
