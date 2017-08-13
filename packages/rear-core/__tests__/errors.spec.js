const {CommandFailure, RuntimeModuleNotFound} = require('../errors');

describe('CommandFailure', () => {
  it('Should create a CommandFailure error', () => {
    const command = 'npm install --exact rear-corr';
    const exitCode = 3;

    const expectedCode = 'ECMDFAILURE';
    const expectedErrno = 500;
    const expectedMessage = `'${command}' has failed with exit code ${exitCode}`;

    const err = new CommandFailure(command, exitCode);

    expect(err.code).toBe(expectedCode);
    expect(err.errno).toBe(expectedErrno);
    expect(err.message).toEqual(expectedMessage);
    expect(err.command).toEqual(command);
    expect(err.exitCode).toEqual(exitCode);
  });

  it('Should throw TypeError if command is not a string', () => {
    try {
      const err = new CommandFailure(null, 1);
    } catch (err) {
      expect(err.constructor.name).toEqual('TypeError');
      expect(err.message).toEqual('Command must be a string. Received: object');
    }
  });

  it('Should throw TypeError if exit code is not a number', () => {
    try {
      const err = new CommandFailure('ping', null);
    } catch (err) {
      expect(err.constructor.name).toEqual('TypeError');
      expect(err.message).toEqual('Command must be a string. Received: object');
    }
  });

});

describe('RuntimeModuleNotFound', () => {
  it('Should create a RuntimeModuleNotFound error', () => {
    const expectedModule = 'fake-module';
    const expectedRealm = 'my-function';
    const sourceFile = `/Users/foobar/code/fake-app/src/${expectedRealm}.js`;
    const moduleNotFoundError = {
      message: `Cannot find '${expectedModule}'`,
      code: 'MODULE_NOT_FOUND'
    };

    const expectedCode = 'EMODULENOTFOUND';
    const expectedErrno = 404;
    const expectedMessage = `Rear '${expectedRealm}' depends on `
        + `'${expectedModule}' module. Please install '${expectedModule}' `
        + `module to fix this error.`;

    const err = new RuntimeModuleNotFound(moduleNotFoundError, sourceFile);

    expect(err.code).toBe(expectedCode);
    expect(err.errno).toBe(expectedErrno);
    expect(err.message).toEqual(expectedMessage);
    expect(err.realm).toEqual(expectedRealm);
    expect(err.moduleName).toEqual(expectedModule);
  });

  it('Should throw TypeError if error has no message', () => {
    try {
      const err = new RuntimeModuleNotFound(null, __filename);
    } catch (err) {
      expect(err.constructor.name).toEqual('TypeError');
      expect(err.message).toEqual(
        'Provided Error is undefined or has no error message'
      );
    }
  });

  it('Should thow TypeError if realm is not a string', () => {
    try {
      const err = new RuntimeModuleNotFound(new Error('failure'), null);
    } catch (err) {
      expect(err.constructor.name).toEqual('TypeError');
      expect(err.message).toEqual('Realm must be a string. Received: object');
    }
  });
});
