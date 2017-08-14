const runtimeRequire = require('../runtime-require');

it('Should throw RuntimeModuleNotFound for non existing modules', () => {
  try {
    const nonExistentModule = runtimeRequire('test-module', __filename);
  } catch (err) {
    expect(err.constructor.name).toEqual('RuntimeModuleNotFound');
  }
});

it('Should successfully require existent module', () => {
  const path = runtimeRequire('path', __filename);
  expect(path).toBeDefined();
});
