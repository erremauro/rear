const fs = require('fs-extra');
const path = require('path');
const tmpDir = path.join(__dirname, '/tmp');
const errNo = require('../lib/errno');
const checkAppName = require('../lib/check-app-name');

let origin;

beforeEach(() => {
  origin = process.cwd();
  fs.ensureDir(tmpDir);
});

afterEach(() => {
  process.chdir(origin);
  fs.remove(tmpDir);
})

test('Should create valid app name', () => {
  const validAppName = 'test-app';
  const expectedPath = path.join(tmpDir, validAppName);

  process.chdir(tmpDir);

  const root = checkAppName({
    programName: 'rear new test',
    appName: validAppName,
    origin: process.cwd(),
  });

  expect(typeof root).toBe('string');
  expect(root).toBe(expectedPath);
});

test('Should fail to create app with missing name', () => {
  process.chdir(tmpDir);

  try {
    const root = checkAppName({
      programName: 'rear new test',
      appName: undefined,
      origin: process.cwd(),
    });
  } catch(err) {
    expect(err.code).toBe(errNo.appNameNotFound.code);
    expect(err.errno).toBe(errNo.appNameNotFound.errno);
  }
})

test('Should fail to create invalid npm app name', () => {
  const invalidAppName = 'testApp';

  const origin = process.cwd();
  process.chdir(tmpDir);

  try {
    const root = checkAppName({
      programName: 'rear new test',
      appName: invalidAppName,
      origin: process.cwd(),
    });
  } catch(err) {
    expect(err.code).toBe(312);
  }
});
