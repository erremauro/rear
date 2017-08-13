const fs = require('fs-extra');
const path = require('path');
const transpile = require('../transpile');
const tmpDir = path.join(__dirname, 'tmp');

const sourceDir = path.join(tmpDir, 'src');
const publicDir = path.join(tmpDir, 'public');
const filename = 'TestObject.js';
const sourceFile = path.join(sourceDir, filename);
const log = console.log;

const validSourceCode = `
  /** @flow */
  type TestProps = {
    name: string,
    version: string
  };

  class TestObject {
    static defaultProps: TestProps = {
      name: 'Test',
      version: '1.0.0'
    };

    props: TestProps;

    constructor (props: TestProps) {
      this.props = Test.defaultProps;
      this.setProps(props);
    }

    setProps (newProps: TestProps): void {
      this.props = Object.assign({}, this.props, newProps);
    }

    getProps (): TestProps {
      return Object.assign({}, this.props);
    }
  }

  export default TestObject;
`;

const invalidSourceCode = `
  /** @flow */
  const TestObject = {
    name: string // missing colon!
    version: string
  };
`;

describe('transpile', () => {
  beforeEach(() => {
    fs.ensureDirSync(tmpDir);
    console.log = () => {};
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
    console.log = log;
  });

  it('Should transform a valid flowtype source file', () => {
    createTestSourceFile(validSourceCode);

    const opts = {
      file: sourceFile,
      src: sourceDir,
      dest: publicDir,
      babelOptions: {
        presets: ['rear']
      }
    };

    return transpile(opts).then(() => {
      const exists = fs.existsSync(path.join(publicDir, filename));
      expect(exists).toBeTruthy();
      console.log = log;
    });
  });

  it('Should fail to transform an invalid typed source code', () => {
    createTestSourceFile(invalidSourceCode);

    const opts = {
      file: sourceFile,
      src: sourceDir,
      dest: publicDir,
      babelOptions: {
        presets: ['rear']
      }
    };

    expect.assertions(1);

    return transpile(opts).catch(err => {
      expect(err).toBeDefined();
    });
  });
});

function createTestSourceFile (content) {
  fs.ensureDirSync(sourceDir);
  fs.ensureDirSync(publicDir);
  fs.writeFileSync(sourceFile, content);
}
