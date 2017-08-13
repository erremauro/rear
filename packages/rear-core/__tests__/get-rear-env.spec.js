const fs = require('fs-extra');
const path = require('path');
const tmpDir = path.join(__dirname, 'tmp');

const REAR_PROCESS_TEST = 'REAR_PROCESS_TEST';
const REAR_DOTENV_TEST = 'REAR_DOTENV_TEST';
const REAR_PACKAGE_TEST = 'REAR_PACKAGE_TEST';
const PKG_FILE = path.join(tmpDir, 'package.json');
const DOTENV_FILE = path.join(tmpDir, '.env');

describe('get-rear-env', () => {
  beforeEach(() => {
    fs.ensureDirSync(tmpDir);
    fs.writeFileSync(PKG_FILE, JSON.stringify({
      name: 'get-rear-env-test',
      version: '0.1.0',
      private: true,
      dependencies: {
        'rear-core': '^0.1.0'
      },
      rear: {
        package: {
          test: 'REAR_PACKAGE_TEST'
        }
      }
    }, null, 2));
    fs.writeFileSync(DOTENV_FILE, 'REAR_DOTENV_TEST=REAR_DOTENV_TEST');
    process.env.REAR_PROCESS_TEST = REAR_PROCESS_TEST;
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
    delete process.env.REAR_PROCESS_TEST;
  });

  it('Should get rear-only environmet variables', () => {
    const expectedPropCount = 4;
    const root = process.cwd();
    process.chdir(tmpDir);

    const env = require('../get-rear-env')();
    const actualPropCount = Object.keys(env || {}).length;

    process.chdir(root);

    expect(actualPropCount).toEqual(expectedPropCount);
    expect(env.REAR_PROCESS_TEST).toEqual(REAR_PROCESS_TEST);
    expect(env.REAR_DOTENV_TEST).toEqual(REAR_DOTENV_TEST);
    expect(env.REAR_PACKAGE_TEST).toEqual(REAR_PACKAGE_TEST)
    expect(env.NODE_ENV).toEqual('test');
  });
});
