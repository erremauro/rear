# run-flow

Use `run-flow` to run [flow] type check (`flow-bin` module must be installed).

## Examples

  ```javascript
  const runFlow = require('rear-core/run-flow');

  runFlow()
    .then() => {
      console.log('Done.');
    })
    .catch(() => {
      console.error('Type check failed.');
    });
  ```

## Async syntax

  ```javascript
  const runFlow = require('rear-core/run-flow');

  async function typecheck () {
    try {
      await runFlow();
      console.log('Done.');
    } catch (err) {
      console.log('Type check failed');
    }
  }
  ```

## API

#### async runFlow ()

Asynchronously run [flow] type check and print errors. The promise resolves on
successful type checking, otherwise a `CommandFailure` error is thrown.

#### Returns

A `Promise` that resolves on [flow] successful type check results.

#### Throws

| Error                   | Description                                   |
|-------------------------|-----------------------------------------------|
| `RuntimeModuleNotFound` | Thrown if `flow-bin` module is not installed  |
| `CommandFailure`        | Thrown if the command exit with an error code |

#### Requires

* `flow-bin`

[flow]: https://flow.org
