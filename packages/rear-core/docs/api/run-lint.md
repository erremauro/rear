# run-lint

Use `run-lint` to lint your code with [eslint].

## Examples

Use `chokidar` to watch a folder and automatically lint all javascript files
upon change. If lint errors are found they will be printed to the console using
the `reporter`.

  ```javascript
  const chokidar = require('chokidar';)
  const reporter = require('rear-logger')('lint-reporter');
  const runLint = require('rear-core/run-lint');

  const src = './src';
  const files = new Set();

  // creates a chokidar watcher that polls `./src` every 300ms
  // for changes in `*.js` files only.
  const watcher = chokidar.watch('./src', {
    usePolling: true,
    alwaysStat: true,
    interval: 300,
    ignored: /((^|[/\\])\.|.+\.(?!(js*)$)([^.]+$))/
  });

  watcher.on('add', file => files.add(file));

  // convert `files` to an Array and run lint against all files.
  // If errors are found, they will be printed using the reporter,
  // additionally a message saying: "Edit and save to lint again" will inform
  // the user, otherwise a simple "No errors!" message will be shown.
  watcher.on('change', () => {
    const lintFiles = Array.from(files);
    const success = runLint(lintFiles, reporter);

    if (success) {
      console.log('No errors!');
    } else {
      console.error('Lint failed. Edit and save your code to lint again.');
    }
  });
  ```

## API

#### runLint ( files: string[], reporter?: LintReporter): boolean

Lint your source code using [eslint] and optionally print lint results
using a `LintRepoter` compatible logger like [rear-logger] or [debug].

##### Arguments

| Argument  | Type          | Description                    |
|-----------|---------------|--------------------------------|
| files     | string[]      | A list of files to be linted   |
| reporter? | LintReporter  | A reporter to log lint results |

##### Returns

`boolean` True if lint pass without errors, otherwise false.

##### Throws

| Error                   | Description                                   |
|-------------------------|-----------------------------------------------|
| `RuntimeModuleNotFound` | Thrown if `eslint` module is not installed    |

##### Requires

* `eslint`

#### Interfaces

##### LintReporter

A logger that can print color formatted messages to the console. [rear-logger]
and [debug] are on of those.

###### log (message: string, ...args: any[]): void

###### error (message: string, ...args: any[]): void

[eslint]: http://eslint.org
[rear-logger]: https://github.com/rearjs/rear-logger
[debug]: https://github.com/visionmedia/debug
