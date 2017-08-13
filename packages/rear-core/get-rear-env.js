const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const resolveApp = require('./resolve-app');
const REAR_ENV = /^REAR_/i;
const dotenvFile = resolveApp('.env');
let dotenvEnv;

let packageJsonEnv;
module.exports = getRearEnv;

/////////////////////////////////

/**
 * Get rear-only variables from `process.env`, '.env' and 'package.json'.
 * `NODE_ENV` is also carried over to inspect the running environment.
 *
 * @return {Object} Rear Environment Dictionary
 */

function getRearEnv () {
  // Instead of using 'dotenv.config()' to automatically load
  // the local .env file content, we read and parse the file manually to avoid
  // polluting 'process.env'.
  if (!dotenvEnv && fs.existsSync(dotenvFile)) {
    dotenvEnv = dotenv.parse(fs.readFileSync(dotenvFile));
  }

  // read local 'package.json' once and flatten its content
  // into a key/value dictionary
  if (!packageJsonEnv) {
    packageJsonEnv = toDictionary(
      require('./get-package-json')()
    );
  }

  const mergedEnv = Object.assign({}, process.env, packageJsonEnv, dotenvEnv);
  // filters rear-only environment variables
  // from 'process.env', '.env' and 'package.json'
  // (NODE_ENV is also carried over)
  return Object.keys(mergedEnv)
    .filter(key => REAR_ENV.test(key))
    .reduce((env, key) => {
      env[key] = mergedEnv[key];
      return env;
    }, {
      // Useful for determining the environment we're running in.
      NODE_ENV: process.env.NODE_ENV || 'development',
    });
}

function toDictionary (obj) {
  const dict = {};
  flatten(obj, (prop, value) => {
    // honor environment variables naming format
    // i.e. rear_client-scripts -> REAR_CLIENT_SCRIPTS
    const propName = prop.replace(/-/g, '_').toUpperCase();
    dict[propName] = value;
  });
  return dict;
}

function flatten (obj, func, root) {
  for (const propName in obj) {
    const builtProp = root ? `${root}_${propName}` : propName;
    if (typeof obj[propName] === 'object') {
      flatten(obj[propName], func, builtProp);
      continue;
    }
    func.apply(this, [builtProp, obj[propName]]);
  }
}
