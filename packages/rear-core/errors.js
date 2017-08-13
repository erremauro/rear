const path = require('path');
const RearError = require('./rear-error');

class CommandFailure extends RearError {
  constructor (command, exitCode = null) {
    if (typeof command !== 'string') {
      throw new TypeError(
        'Command must be a string. Received: ' + typeof command
      );
    }

    let message = `'${command}' has failed`;

    if (typeof exitCode === 'number') {
      message += ` with exit code ${exitCode}`
    }

    super(message, {
      code: 'ECMDFAILURE',
      description: message,
      errno: 500
    });
    this.command = command;
    this.exitCode = exitCode;
  }
}

class RuntimeModuleNotFound extends RearError {
  constructor (err, realm) {
    if (typeof realm !== 'string') {
      throw new TypeError('Realm must be a string. Received: ' + typeof realm);
    }

    if (!err || !err.message) {
      throw new TypeError(
        'Provided Error is undefined or has no error message'
      );
    }

    const parsedRealm = RuntimeModuleNotFound.parseRealm(realm);
    const moduleName = RuntimeModuleNotFound.getModuleName(err.message);
    const message = `Rear '${parsedRealm}' depends on '${moduleName}' module. `
        + `Please install '${moduleName}' module to fix this error.`;

    super(message, {
      code: 'EMODULENOTFOUND',
      description: 'Rear failed to find a module at runtime.',
      errno: 404,
      innerErr: err
    });

    this.moduleName = moduleName;
    this.realm = parsedRealm;
  }
}

RuntimeModuleNotFound.getModuleName = (message) => {
  const firstLine = message.split('\n')[0];
  const matches = message.match(/^.*'(.*)'$/);
  if (matches && matches.length > 0) {
    return matches[1];
  }
  return 'unknown';
}

RuntimeModuleNotFound.parseRealm = (realm) => {
  if (path.extname(realm) !== '') {
    realm = path.basename(realm, path.extname(realm));
  }
  return realm;
}

module.exports = {
  CommandFailure,
  RuntimeModuleNotFound
};
