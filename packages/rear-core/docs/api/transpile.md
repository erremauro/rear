# transpile

Use `transpile` to transform javascript code using babel.

## Example

  ```javascript
  const path = require('path');
  const transpile = require('rear-core/transpile');

  const sourceDir  = path.join('./src');
  const destDir    = path.join('./public');
  const sourceFile = path.join(sourceDir, 'index.js');

  const opts = {
    file: sourceFile,
    src: sourceDir,
    dest: destDir
  }

  traspile(opt)
    .then(() => {
      console.log('Done');
    })
    .catch((err) => {
      console.error('Error: ', err.message);
    });
  ```

### Async syntax

  ```javascript
  import traspile from 'rear-core/transpile';

  const babelOptions = {
    compact: false,
    comments: true
  }

  async function compile (files, src, dest) {
    files.forEach(file => {
      try {
        await transpile({file, src, dest, babelOptions});
      } catch (err) {
        if (err) {
          throw new Error('Compilation failed: ' + err.message);
        }
      }
    });
  }
  ```

## API

#### async transpile (opts: TranspileOpts): string

Transform a file from a source directory into a destination directory, using
babel.

##### Returns

`Promise<string>` Resolves with the resulting file path.

##### Throws

| Error                   | Description                                       |
|-------------------------|---------------------------------------------------|
| `RuntimeModuleNotFound` | Thrown if `babel-core` module is not installed    |

### Requires

* `babel-core`

### Types

#### TranspileOpts

By default babel will remove all `comments` and produce a `compact` version of
the `file`. You can customize this and other [babel options] by passing a custom
`babelOptions` object.

| Property      | Type   | Description                        |
|---------------|--------|------------------------------------|
| babelOptions? | Object | Babel options                      |
| file          | string | Path to the file to be transformed |
| src           | string | Source directory path              |
| dest          | string | Destination directory path         |

[babel options]: https://babeljs.io/docs/usage/api/#options
