# run-command

Use `run-command` to asynchronously run a command and optionally suppress
its output.

## Example

  ```javascript
  const runCommand = require('rear-core/run-command');

  runCommand('npm', ['install', '--save-dev', 'rear-core'])
    .then(() => {
      // command ran successfully,
      // do stuff...
    })
    .catch(err => {
      // handle error...
    });
  ```

### Async syntax

```javascript
const runCommand = require('rear-core/run-command');

// expect calling function to handle errors
async function install (): Promise<void> {
  await runCommand('npm', ['install', '--save-dev', 'rear-core'], 'ignore');
  // command ran successfully,
  // do stuff...
  return Promise.resolve();
}
```

## API

#### async runCommand ( cmd: string, args: string[], stdio?: string )

Asynchronously run a command that resolves on successful completion.

##### Arguments

| Argument | Type           | Description    |
|----------|----------------|----------------|
| cmd      | `string`       | Command to run |
| args     | `Array<string>`| Command arguments. Default value: [] |
| [stdio]  | `string`       | Use `'ignore'` to suppress output. Default value: `'inherit'` |

##### Returns

A `Promise` that resolves on exit.

##### Throws

`CommandFailure` if the exit code is non zero.

##### Requires

* `cross-spawn`
