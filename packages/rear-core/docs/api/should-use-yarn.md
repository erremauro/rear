# should-use-yarn

Use `should-use-yarn` to check [yarn] package manager availability.

## Example

  ```javascript
  const shouldUseYarn = require('rear-core/should-use-yarn');
  const runCommand = require('rear-core/run-command');

  let command = shouldUseYarn() ? 'yarn' : 'npm';

  runCommand(command, ['install'])
    .then(() => {
      console.log('All package installed');
    });
  ```

## API

#### shouldUseYarn (): boolean

Check if [yarn] is installed.

##### Returns

`boolean` True is `yarnpkg` executable is availability, otherwise false.

[yarn]: https://yarnpkg.com/
